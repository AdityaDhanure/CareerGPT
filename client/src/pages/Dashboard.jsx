import React, { useMemo, useCallback, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaDownload, FaArrowUp, FaSquare, FaEdit, FaEdge } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { marked } from 'marked';
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';


export const Dashboard = React.memo(function Dashboard() {
    const [skills, setSkills] = useState([]);
    const [goals, setGoals] = useState("");
    const [loading, setLoading] = useState(false); // ← Loading state for generating roadmap
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [isLogin, setIsLogin] = useState(false);
    const [userPhoto, setUserPhoto] = useState(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null); // ← State to hold the selected roadmap for display
    const [roadmaps, setRoadmaps] = useState([]); // ← State to hold all roadmaps and display in sidebar
    const [abortController, setAbortController] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null); // Reference for the button to close dropdown
    const [selectedDropdownId, setSelectedDropdownId] = useState(null); // State to manage which edit menu is open

    const inputRef = useRef({});
    const editDeleteRef = useRef(null); // Reference for the edit/delete dropdown
    const [editingId, setEditingId] = useState(null);
    const [editedTitles, setEditedTitles] = useState({});

    const [clickedDeleted, setClickedDeleted] = useState(false);
    const [deletedRoadmap, setDeletedRoadmap] = useState(null);

    const roadmapRef = useRef();

    const [showSidebar, setShowSidebar] = useState(true);
    const isMidScreen = useMediaQuery({ query: '(min-width: 770px)' });

    


    // Handle fetching user data
    useEffect(() => {
        async function fetchUser() {
            await axios.get(`${BE_BASE_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(res => {
                setUser(res.data);
                setIsLogin(true);
                setUserPhoto(res.data.photoURL);
            })
        }
        fetchUser();
    }, []);

    // Handle fetching roadmaps
    useEffect(() => {
        async function fetchRoadmaps() {
            try {
                const res = await axios.get(`${BE_BASE_URL}/api/roadmap/`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
                });
                setRoadmaps(res.data.roadmaps);
            } catch (err) {
                console.error("No Roadmaps found  OR  Failed to fetch roadmaps ", err);
            }
        }
        fetchRoadmaps();
    }, [selectedRoadmap]);


    // Generate roadmap after clicking send or pressing Enter
    const handleCreate = useCallback(async () => {
        const controller = new AbortController();
        setAbortController(controller);
        try {
            setLoading(true);
            setSelectedRoadmap(null);
            if (!skills || !goals) {
                //alert("Please enter both skills and goals.");
                setLoading(false);
            return;
            }
            const res = await axios.post(`${BE_BASE_URL}/api/roadmap/generate`, {
                skills: skills.split(',').map(s => s.trim()),
                goal: goals
            }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                },
                signal: controller.signal
            });

            setSelectedRoadmap(res.data.roadmap);
            setRoadmaps(prev => [...prev, res.data.roadmap]);
            setSkills("");     // <- Clear skills input after generation
            setGoals("");      // <- Clear goals input after generation
            setLoading(false);
        } catch (err) {
            console.error("Generation is Stopped  OR  Error generating roadmap:", err);
            setLoading(false);
        }
    }, [skills, goals]);

    // Handle aborting the request if loading
    const handleButtonClick = useCallback(() => {
        if (loading && abortController) {
            abortController.abort();
        } else {
            handleCreate();
            setSkills("");     // <- Clear skills input after generation
            setGoals("");      // <- Clear goals input after generation
        }
    }, [loading, abortController, handleCreate]);


    // Handle Enter key to trigger handleCreate
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && (skills || goals)) {
                handleCreate();
                setSkills("");     // <- Clear skills input after generation
                setGoals("");      // <- Clear goals input after generation
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [skills, goals]);

    // handle sorting roadmaps by createdAt date
    const sortedRoadmaps = useMemo(() => {
        return [...roadmaps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [roadmaps]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target) ||
            editDeleteRef.current &&
            !editDeleteRef.current.contains(event.target)
        ) {
            setShowDropdown(false);
            setSelectedDropdownId(null);
        }}
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); 


    // Handle exporting roadmap as PDF
    const handleExportRoadmap = useCallback(async () => {
        const element = roadmapRef.current;
        if (!element) {
            console.error("No roadmap content to export");
            return;
        }
        const html = element.innerHTML;
        if (!html) {
            console.error("No content to export");
            return;
        }
        try{
            const response = await axios.post(`${BE_BASE_URL}/api/roadmap/export`, {
                htmlContent: `<html><head><style>body{font-family:Arial;}</style></head><body>${html}</body></html>`,
            },{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                responseType: 'blob' // Ensure the response is treated as a blob
            });

            // Trigger file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Roadmap.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting roadmap:", error);
            console.error(error.response?.data || error.message);
            alert("Failed to export roadmap. Please try again.");
        }
    }, [selectedRoadmap]);


    // Handle editing roadmap title
    const handleEdit = useCallback((roadmap) => {
        const titleToUpdate = editedTitles[roadmap.id];
        if (!roadmap || !titleToUpdate || titleToUpdate.trim() === "") {
            alert("Invalid title");
            return;
        }

        axios.put(`${BE_BASE_URL}/api/roadmap/update-title/${roadmap.id}`, {
            title: titleToUpdate
        }, {
            headers: {
                "Authorization": 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setRoadmaps(prev => prev.map(rm => rm.id === roadmap.id ? res.data.roadmap : rm));
            setSelectedRoadmap(res.data.roadmap);
            setEditingId(null); // Exit editing mode
        }).catch(err => {
            console.error("Error updating title", err);
        });
    }, [editedTitles, roadmaps]);

    useEffect(() => {
        if (inputRef.current[editingId]) {
            inputRef.current[editingId].focus();
            inputRef.current[editingId].select(); // Select the text in the input
        }
    }, [editingId]);

    // Handle deleting roadmap
    const handleDelete = useCallback((roadmapId) => {
        if (!roadmapId){
            console.error("Invalid roadmap ID for deletion"); 
            return;
        };

        axios.delete(`${BE_BASE_URL}/api/roadmap/delete/${roadmapId}`, {
            headers: {
                "Authorization": 'Bearer ' + localStorage.getItem('token')
            }
        }).then(() => {
            setRoadmaps(prev => prev.filter(rm => rm.id !== roadmapId));
            setSelectedRoadmap(null);
            setDeletedRoadmap(null);
            alert("Roadmap deleted successfully!");
        }).catch(err => {
            console.error("Error deleting roadmap", err);
        });
    }, []);

    // Marked variables to format content with clean font size and line breaks and headings
    const cleanHTMLTitle = marked.parse(selectedRoadmap?.title || '');
    const cleanHTMLContent = marked.parse(selectedRoadmap?.content || '');


  return (
    <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="flex space-x-2 sm:w-40 md:w-60 lg:w-64  fixed bg-gray-100 shadow  px-2 sm:px-6   py-2 sm:py-2.5 md:py-3 lg:py-4">
            <motion.img 
                className='h-7 sm:h-8 md:h-9 lg:h-10 rounded-full cursor-pointer' 
                src='/assets/Logo1.png' 
                whileHover={{ 
                    scale: 1.3,
                    transition: {
                        duration: 0.1,
                        repeatType: "loop",
                        ease: "easeInOut" 
                    }
                 }}
                whileTap={{ rotateY: 180 }} 
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onClick={() => setShowSidebar(prev => !prev)}/>
            <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl  font-bold text-blue-600">CareerGPT</h2>
        </div>

        {isMidScreen ? (
            <aside className="w-50 sm:w-55 md:w-60 lg:w-64  fixed top-[46px] sm:top-13.5 md:top-15.5 lg:top-19  h-160 sm:h-157 md:h-155 lg:h-150  overflow-y-auto shadow bg-gray-100   px-1.25 sm:px-2 md:px-2.5 lg:px-3">
                {/* Sidebar content (ul block) goes here */}
                <ul className="space-y-1 md:space-y-1.5 lg:space-y-2  my-1 sm:my-1.5 md:my-2 lg:my-3  max-h-screen ">
                    {sortedRoadmaps.length > 0 ? (
                        sortedRoadmaps.map((rm, idx) => {
                        return (
                        <li
                            key={idx}
                            className={`flex items-center group justify-between  h-8 md:h-9 lg:h-10  cursor-pointer  rounded-md md:rounded-lg  transition  ${
                                        selectedRoadmap?.id === rm.id ? 'bg-blue-300 hover:bg-blue-300' : 'bg-gray-200 hover:bg-gray-300'}`}>
                            <div 
                                className="truncate w-full  p-1 md:p-2  rounded-md md:rounded-lg  whitespace-nowrap text-ellipsis"
                                onClick={() => setSelectedRoadmap(rm)}>
                                {(editingId === rm.id) ? (
                                    <div>
                                        <input
                                            ref={(el) => (inputRef.current[rm.id] = el)}
                                            type="text"
                                            value={editedTitles[rm.id] || rm.title}
                                            className="w-full font-bold  py-1 md:py-2 lg:py-2.5  focus:outline-none"
                                            onChange={(e) => {
                                                const updatedTitle = e.target.value;
                                                setEditedTitles(prev => ({ ...prev, [rm.id]: updatedTitle }));
                                            }}
                                            onBlur={() => handleEdit(rm)}
                                        />
                                    </div>
                                ) : (
                                    <strong>{rm.title}</strong>
                                )}
                            </div>

                            {/* Dots button (only visible on hover) */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent selecting roadmap when clicking dots
                                        setSelectedDropdownId((prev) => (String(prev) === String(rm.id) ? null : rm.id));
                                    }}
                                    className="text-xl mb-4 p-1.5 opacity-0 group-hover:opacity-100 hover:cursor-pointer transition-opacity">
                                    ...
                                </button>

                                {(selectedDropdownId === rm.id) && (
                                    <div ref={(editDeleteRef)} className="absolute right-0  top-11 md:top-12 lg:top-13  flex flex-col bg-white shadow-lg z-10">
                                        {/* Edit option */}
                                        <button
                                            className="px-3 md:px-4 lg:px-5  py-1 md:py-1.5 lg:py-2  text-sm md:text-md  bg-gray-100 hover:bg-gray-200 space-x-2 flex items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletedRoadmap(null); // Reset deleted roadmap
                                                setEditingId(rm.id);
                                                setEditedTitles(prev => ({ ...prev, [rm.id]: rm.title }));  
                                                setSelectedDropdownId(null);                                   
                                            }}>
                                            <FaEdit/>
                                            <div>Edit</div>
                                        </button>

                                        {/* Delete option */}
                                        <button
                                            className="px-3 md:px-4 lg:px-5  py-1 md:py-1.5 lg:py-2  text-sm md:text-md bg-gray-100 hover:bg-gray-200 space-x-2 flex items-center"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent selecting roadmap when clicking delete
                                                setEditingId(null); // Exit editing mode
                                                setDeletedRoadmap(rm);
                                                setClickedDeleted(true);
                                                setSelectedDropdownId(null);
                                            }}>                                           
                                            <FaEdge />
                                            <div>Delete</div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                        )})
                    ) : (
                        <p className="text-gray-500">No roadmaps found.</p>
                    )}
                </ul>
            </aside>
        ) : (
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3 }}
                        className="w-60 lg:w-64  fixed top-[46px] sm:top-13.5 md:top-15.5 lg:top-19  h-160 sm:h-140 md:h-155 lg:h-150  overflow-y-auto shadow bg-gray-100   px-1.25 sm:px-2 md:px-2.5 lg:px-3"
                    >
                        <ul className="space-y-1 md:space-y-1.5 lg:space-y-2  my-1 sm:my-1.5 md:my-2 lg:my-3  max-h-screen ">
                            {sortedRoadmaps.length > 0 ? (
                                sortedRoadmaps.map((rm, idx) => {
                                return (
                                <li
                                    key={idx}
                                    className={`flex items-center group justify-between  h-8 md:h-9 lg:h-10  cursor-pointer  rounded-md md:rounded-lg  transition  ${
                                                selectedRoadmap?.id === rm.id ? 'bg-blue-300 hover:bg-blue-300' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                    <div 
                                        className="truncate w-full  p-1 md:p-2  rounded-md md:rounded-lg  whitespace-nowrap text-ellipsis"
                                        onClick={() => setSelectedRoadmap(rm)}>
                                        {(editingId === rm.id) ? (
                                            <div>
                                                <input
                                                    ref={(el) => (inputRef.current[rm.id] = el)}
                                                    type="text"
                                                    value={editedTitles[rm.id] || rm.title}
                                                    className="w-full font-bold  py-1 md:py-2 lg:py-2.5  focus:outline-none"
                                                    onChange={(e) => {
                                                        const updatedTitle = e.target.value;
                                                        setEditedTitles(prev => ({ ...prev, [rm.id]: updatedTitle }));
                                                    }}
                                                    onBlur={() => handleEdit(rm)}
                                                />
                                            </div>
                                        ) : (
                                            <strong>{rm.title}</strong>
                                        )}
                                    </div>

                                    {/* Dots button (only visible on hover) */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent selecting roadmap when clicking dots
                                                setSelectedDropdownId((prev) => (String(prev) === String(rm.id) ? null : rm.id));
                                            }}
                                            className="text-xl mb-4 p-1.5 opacity-0 group-hover:opacity-100 hover:cursor-pointer transition-opacity">
                                            ...
                                        </button>

                                        {(selectedDropdownId === rm.id) && (
                                            <div ref={(editDeleteRef)} className="absolute right-0  top-11 md:top-12 lg:top-13  flex flex-col bg-white shadow-lg z-10">
                                                {/* Edit option */}
                                                <button
                                                    className="px-3 md:px-4 lg:px-5  py-1 md:py-1.5 lg:py-2  text-sm md:text-md  bg-gray-100 hover:bg-gray-200 space-x-2 flex items-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletedRoadmap(null); // Reset deleted roadmap
                                                        setEditingId(rm.id);
                                                        setEditedTitles(prev => ({ ...prev, [rm.id]: rm.title }));  
                                                        setSelectedDropdownId(null);                                   
                                                    }}>
                                                    <FaEdit/>
                                                    <div>Edit</div>
                                                </button>

                                                {/* Delete option */}
                                                <button
                                                    className="px-3 md:px-4 lg:px-5  py-1 md:py-1.5 lg:py-2  text-sm md:text-md bg-gray-100 hover:bg-gray-200 space-x-2 flex items-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent selecting roadmap when clicking delete
                                                        setEditingId(null); // Exit editing mode
                                                        setDeletedRoadmap(rm);
                                                        setClickedDeleted(true);
                                                        setSelectedDropdownId(null);
                                                    }}>                                           
                                                    <FaEdge />
                                                    <div>Delete</div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                                )})
                            ) : (
                                <p className="text-gray-500">No roadmaps found.</p>
                            )}
                        </ul>
                    </motion.aside>
                )}
            </AnimatePresence>
        )}


        {/* Main Content */}
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
            {/* Topbar */}
            <header className="bg-gray-100 fixed  w-73 sm:w-123.5 md:w-140 lg:w-319.5  ml-35 sm:ml-40 md:ml-60.5 lg:ml-64  shadow  px-3 sm:px-4 md:px-5 lg:px-6  py-2 sm:py-2.25 md:py-3 lg:py-4  flex items-center justify-between">
                <h1 className="text-md sm:text-xl md:text-2xl lg:text-3xl  font-bold">Generate Roadmaps</h1>
                <div className="text-sm md:text-md  text-gray-700 flex items-center  space-x-2 md:space-x-3 lg:space-x-4">
                    <button className='flex items-center space-x-1 bg-gray-400 text-white  px-2 sm:px-3 md:px-4  py-1 sm:py-1.75 md:py-2  rounded-full hover:bg-gray-500 transition'
                            onClick={handleExportRoadmap}>
                        <div>
                            Export
                        </div> 
                        <div>
                            <FaDownload />
                        </div>
                    </button>
                    <div className="relative" ref={dropdownRef}>
                        <img
                            className="w-7 sm:w-8.5 md:w-9 lg:w-10 rounded-full object-cover border-1 border-blue-500 cursor-pointer"
                            src={userPhoto ? userPhoto : `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`}
                            alt="Guest"
                            onClick={() => setShowDropdown(prev => !prev)}
                        />

                        {showDropdown && (
                            <div ref={buttonRef} className="absolute right-0 mt-2  w-25 sm:w-30 md:w-35 lg:w-40  bg-white rounded-md shadow-lg z-10">
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                <span className="flex items-center space-x-2">
                                    <FaUser />  
                                    <span>Profile</span>
                                </span>
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/signin');
                                }} 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                {(isLogin) ? (
                                    <span className="flex items-center space-x-2">
                                        <FaSignOutAlt />  
                                    <span>Logout</span>
                                </span>
                                ) : (
                                    <span className="flex items-center space-x-2">
                                        <FaSignInAlt />  
                                    <span>Login</span>
                                </span>
                                )}
                                
                            </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Roadmap Body */}
            <main className="bg-[url('/assets/Logo10.png')] bg-cover bg-center h-screen w-full  flex overflow-y-auto  px-14 sm:px-16 md:px-6 lg:px-2  lg:pt-3   max-w-3xl lg:space-y-6  sm:ml-12 md:ml-70 lg:ml-128   mt-17 sm:mt-18 md:mt-19 lg:mt-20   mb-28 sm:mb-30 md:mb-36 lg:mb-40">
                {(selectedRoadmap) ? (
                    <div ref={roadmapRef} className="whitespace-pre-wrap text-gray-800">
                        <h2 className="text-2xl font-bold mb-4 prose prose-md text-gray-800"
                            dangerouslySetInnerHTML={{ __html: cleanHTMLTitle }}
                        />
                        <div className="prose prose-md text-gray-800"
                             dangerouslySetInnerHTML={{ __html: cleanHTMLContent }}
                        />
                    </div>
                ) : loading ? (
                    <div className="text-gray-500 text-lg animate-pulse">
                        Generating roadmap...
                    </div>
                ) : (
                    <div className="text-gray-500 text-lg">
                        Select a roadmap from the sidebar or generate one below.
                    </div>
                )}
            </main>

            <main className="pb-3 sm:pb-4 md:pb-5 lg:pb-6  bg-gray-100  ml-5.5 sm:ml-35 md:ml-85 lg:ml-15  fixed bottom-0 lg:left-50 lg:right-0"> 
                <div className="max-w-3xl mx-auto px-3 md:px-4  py-2 sm:py-2.5 md:py-3 lg:py-4  bg-white shadow rounded-3xl flex items-center justify-between space-x-4">
                    <div className='w-full'>
                        <div className='flex space-x-3 '>
                            <h2 className="md:text-lg font-semibold mt-1.5  w-14 md:w-12">Skills:</h2>
                            <input 
                                className='w-full h-8 md:h-9 p-2  mb-2 lg:mb-4  border border-gray-300 rounded focus:outline-none'
                                placeholder="e.g. JavaScript, React, Node.js"
                                type="text" 
                                value={skills} 
                                onChange={(e) => setSkills(e.target.value)}/>
                        </div>
                        <div className='flex space-x-3'>
                            <h2 className="md:text-lg font-semibold mt-1.5  w-14 md:w-12">Goals:</h2>
                            <input 
                                className='w-full h-8 md:h-9 p-2 border border-gray-300 rounded focus:outline-none'
                                placeholder="e.g. Become a full-stack developer, Master React"
                                type="text" 
                                value={goals} 
                                onChange={(e) => setGoals(e.target.value)}/>
                        </div>
                    </div>
                    <button
                        onClick={handleButtonClick}
                        className="h-10 md:h-12 bg-blue-500 text-white  px-3 md:px-4  mt-7 md:mt-4  rounded-full hover:bg-blue-600">
                        {loading ? <FaSquare /> : <FaArrowUp/>}
                    </button>
                </div>
            </main>
        </div>

        {/* Delete Confirmation Modal */}
        <div>
            {clickedDeleted && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-40">
                    {/* Background overlay with opacity */}
                    <div className="absolute w-full h-full bg-gray-400 opacity-70"></div>

                    {/* Modal content */}
                    <div className="bg-white z-50  p-3 sm:p-4 md:p-5 lg:p-6  w-80 md:w-fit  rounded-xl shadow-lg">
                        <h2 className="text-sm md:text-xl  font-semibold  mb-2 md:mb-4">Delete Roadmap?</h2>
                        <div className='border-b text-gray-300'></div>
                        <div className='flex justify-center  text-sm md:text-md  mt-2 md:mt-3  mb-3 md:mb-6'>
                            <p>This will delete </p>
                            <p className='px-1 font-bold'>{deletedRoadmap.title}</p>
                            <p>permanently!</p>
                        </div>
                        <div className='flex justify-end'>
                            <button 
                                onClick={() => setClickedDeleted(false)} 
                                className="bg-blue-500 text-white text-sm md:text-md  px-2 md:px-4  py-1 md:py-1.5  rounded-full hover:bg-blue-600">
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white  text-sm md:text-md  px-2 md:px-4  py-1 md:py-1.5  rounded-full hover:bg-red-600 ml-4"
                                onClick={() => {
                                    handleDelete(deletedRoadmap.id);
                                    setClickedDeleted(false);
                                }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    </div>
  );
})