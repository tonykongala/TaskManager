import React from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const authState = useSelector(state => state.authReducer);
  const user = authState.user;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#121212] to-[#1c1c1c] px-4">
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-10 w-full max-w-lg text-white">
        <h2 className="text-4xl font-semibold text-center text-blue-400 mb-8 border-b pb-3 border-gray-600">
          User Profile
        </h2>

        {user ? (
          <div className="space-y-6 text-lg">
            <div className="flex items-center">
              <span className="w-24 font-semibold text-gray-300">Name:</span>
              <span className="text-gray-100">{user.name}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-semibold text-gray-300">Email:</span>
              <span className="text-gray-100">{user.email}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-semibold text-gray-300">Role:</span>
              <span className="inline-block px-3 py-1 rounded-md bg-blue-700 text-white text-sm font-medium">
                {user.role}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400">No user information available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
