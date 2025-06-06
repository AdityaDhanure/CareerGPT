import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [userPhoto, setUserPhoto] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('https://careergpt-be.onrender.com/api/auth/me', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
                });
                setUser(res.data);
                setUserPhoto(res.data.photoURL);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };

        fetchProfile();
    }, []);

    if (!user) return <div className="text-center mt-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-sm md:max-w-xl lg:max-w-4xl  mx-auto bg-white rounded-xl shadow-lg  p-4 sm:p-6 md:p-8">
        <div className="flex items-center  space-x-3 md:space-x-6">
          <img
            className="w-18 md:w-24  h-18 md:h-24  rounded-full object-cover border-2 border-blue-500"
            src={userPhoto ? userPhoto : `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`}
            alt="Profile"
          />
          <div>
            <h2 className="sm:text-2xl md:text-3xl  font-semibold text-gray-800">{user.name}</h2>
            <p className="text-xs sm:text-md md:text-lg text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">ID: {user.id}</p>
          </div>
        </div>

        <div className="mt-4 md:mt-6 border-t pt-4 md:pt-6">
          <h3 className="sm:text-lg font-semibold  mb-1 sm:mb-2  text-gray-700">Account Details</h3>
          <ul className="text-xs sm:text-sm  text-gray-600  space-y-1 sm:space-y-2">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Username:</strong> {user.name}</li>
            <li><strong>Registered On:</strong> {new Date().toLocaleDateString()}</li>
          </ul>
        </div>

        <div className="mt-5 md:mt-6  flex justify-end  space-x-2 md:space-x-4">
            <button 
                className="px-2 md:px-4  py-1.5 md:py-2  text-xs md:text-sm  bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                    navigate('/dashboard');
                }}>Go to Dashboard
            </button>
            <button 
                className="px-2 md:px-4  py-1.5 md:py-2  text-xs md:text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={()=>{
                    navigate('/edit-profile');
                }}>Edit Profile
            </button>
        </div>
      </div>
    </div>
  );
};

