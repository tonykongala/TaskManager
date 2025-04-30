import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/actions/authActions';

const Navbar = () => {
  const authState = useSelector(state => state.authReducer);
  const dispatch = useDispatch();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/tasks/notifications/user", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
      const data = await res.json();
      if (data.status) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const toggleNotifications = async () => {
    const show = !showNotifications;
    setShowNotifications(show);

    if (show) {
      await fetchNotifications();
    }
  };

  useEffect(() => {
    if (authState.isLoggedIn) {
      fetchNotifications();  // fetch notifications once when page loads
    }
  }, [authState.isLoggedIn]);

  return (
    <>
      <header className='flex justify-between sticky top-0 p-4 bg-[#111111] shadow-md items-center z-50 text-white'>
        <h2 className='cursor-pointer uppercase font-medium'>
          <Link to="/"> Task Manager </Link>
        </h2>

        <div className='flex items-center gap-4'>

          {/* Notification bell */}
          {authState.isLoggedIn && (
            <div className="relative">
              <span className='cursor-pointer relative' onClick={toggleNotifications}>
                <i className="fa-solid fa-bell text-xl"></i>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                )}
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-md shadow-lg overflow-y-auto max-h-96 z-50">
                  <div className="p-4">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-600">No notifications</p>
                    ) : (
                      notifications.map((note, index) => (
                        <div key={index} className="mb-2 border-b pb-2 text-sm">
                          {note.message}
                          <div className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navbar buttons */}
          <ul className='hidden md:flex gap-4 uppercase font-medium'>
            {authState.isLoggedIn ? (
              <>
                <li className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md">
                  <Link to='/profile' className='block w-full h-full px-4 py-2'>
                    <i className="fa-solid fa-user"></i> Profile
                  </Link>
                </li>
                <li className='py-2 px-3 cursor-pointer hover:bg-gray-700 transition rounded-sm' onClick={handleLogoutClick}>
                  Logout
                </li>
              </>
            ) : (
              <li className='py-2 px-3 cursor-pointer text-primary hover:bg-gray-100 transition rounded-sm'>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>

          {/* Hamburger menu */}
          <span className='md:hidden cursor-pointer' onClick={toggleNavbar}>
            <i className="fa-solid fa-bars"></i>
          </span>
        </div>

        {/* Mobile Sidebar */}
        <div className={`absolute md:hidden right-0 top-0 bottom-0 transition ${(isNavbarOpen) ? 'translate-x-0' : 'translate-x-full'} bg-[#1a1a1a] shadow-md w-screen sm:w-9/12 h-screen`}>
          <div className='flex'>
            <span className='m-4 ml-auto cursor-pointer text-white' onClick={toggleNavbar}>
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
          <ul className='flex flex-col gap-4 uppercase font-medium text-center mt-8 text-white'>
            {authState.isLoggedIn ? (
              <>
                <li className="bg-blue-500 text-white hover:bg-blue-600 font-medium transition py-2 px-3">
                  <Link to='/profile' className='block w-full h-full'>
                    <i className="fa-solid fa-user"></i> Profile
                  </Link>
                </li>
                <li className='py-2 px-3 cursor-pointer hover:bg-gray-700 transition rounded-sm' onClick={handleLogoutClick}>
                  Logout
                </li>
              </>
            ) : (
              <li className='py-2 px-3 cursor-pointer text-primary hover:bg-gray-300 transition rounded-sm'>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </header>
    </>
  );
};

export default Navbar;
