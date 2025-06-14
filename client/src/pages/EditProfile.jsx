import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

export const EditProfile = () => {
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [isPassword, setIsPassword] = useState(false);
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreateClicked, setIsCreateClicked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BE_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        setName(res.data.name);
        setOriginalName(res.data.name);
        if(res.data.password.length > 0){
          setIsPassword(true);
        }
        // console.log('User fetched successfully:', res.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  const hasChanged = useMemo(() => {
    return (editingName && name !== originalName) || 
           (editingPassword && currentPassword && newPassword) || 
           (isCreateClicked && createPassword && confirmPassword);
  }, [name, originalName, editingName, currentPassword, newPassword, editingPassword, isCreateClicked, createPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BE_BASE_URL}/api/auth/edit-profile`,
        { // Data to be sent in the request body
          name: editingName ? name : undefined,
          currentPassword: editingPassword ? currentPassword : undefined,
          newPassword: editingPassword ? newPassword : undefined,

          createPassword: isCreateClicked ? createPassword : undefined,
          confirmPassword: isCreateClicked ? confirmPassword : undefined
        },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      );
      setMessage('Profile updated successfully');
      setEditingName(false);
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setOriginalName(name);
      setIsCreateClicked(false);
      setCreatePassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Update failed.');
    }
  };

  return (
    <div className='bg-gray-200 h-screen  pt-8 md:pt-10'>
      <div className="max-w-xs sm:max-w-sm md:max-w-md  mx-auto p-4 sm:p-5 md:p-6  bg-white shadow-md rounded-xl">
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center text-white bg-blue-500 hover:bg-blue-600 hover:cursor-pointer  px-2 md:px-3  py-0.5 md:py-1  rounded-md mb-4">
          Back
        </button>
        <h2 className="sm:text-xl font-semibold  mb-2 md:mb-4">Edit Profile</h2>
        {message && <div className="mb-4 text-green-600">{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div className="mb-2 md:mb-4">
            <label className="block font-medium mb-1">Name</label>
            {!editingName ? (
              <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{name}</span>
                <button type="button" onClick={() => setEditingName(true)} className="text-blue-600 text-sm hover:underline">Edit</button>
              </div>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-2 md:mb-4">
            <label className="block font-medium mb-1">Password</label>

            {!isPassword ? ( // If no password is set i.e.,(false)
              isCreateClicked ? ( // If creating a password i.e.,(true)
                <>
                  <input
                    type="password"
                    placeholder="Create Password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </>
              ) : ( // If no password (false) and not creating i.e.,(false)
                <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className='text-gray-400'>No password set</span>
                  <button
                    type="button"
                    onClick={() => setIsCreateClicked(true)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Create Password
                  </button>
                </div>
              )
            ) : !editingPassword ? ( // If isPassword is (true) and not editing  i.e.,(false)
              <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>********</span>
                <button
                  type="button"
                  onClick={() => setEditingPassword(true)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
              </div>
            ) : ( // If isPassword is (true) and editing i.e.,(true)
              <>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!hasChanged}
            className={`w-full text-white  py-1.5 md:py-2 rounded transition ${
              hasChanged ? 'bg-blue-500 hover:bg-blue-600 hover:cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
