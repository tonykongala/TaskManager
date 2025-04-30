import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useFetch from '../hooks/useFetch';

const Notifications = () => {
  const authState = useSelector(state => state.authReducer);
  const [fetchData] = useFetch();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchNotifications();
  }, [authState.isLoggedIn]);

  const fetchNotifications = async () => {
    const config = {
      url: '/api/tasks/notifications/user',
      method: 'get',
      headers: { Authorization: `Bearer ${authState.token}` }
    };
    const data = await fetchData(config, { showSuccessToast: false });
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  };

  return (
    <div className="p-4 bg-[#111] text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Notifications ({notifications.length})</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications found.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification._id} className="bg-[#1e1e1e] p-4 rounded-md shadow">
              {notification.message}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
