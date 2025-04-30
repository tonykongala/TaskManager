import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useFetch from "../hooks/useFetch";

const NotificationPopup = ({ closePopup }) => {
  const authState = useSelector((state) => state.authReducer);
  const [fetchData] = useFetch();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchNotifications();
  }, [authState.isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      const config = {
        url: '/api/tasks/notifications/user',
        method: 'get',
        headers: {
          Authorization: `Bearer ${authState.token}`  // ✅ Include Bearer
        }
      };
      const data = await fetchData(config, { showSuccessToast: false });
      console.log("🔔 Notification API response:", data);
      if (data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-gray-900 text-white rounded-md shadow-lg z-50">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
        <span className="font-bold">Notifications</span>
        <button onClick={closePopup} className="text-gray-400 hover:text-white">&times;</button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2" aria-live="polite">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className="bg-gray-800 p-2 my-2 rounded-md">
              {notification.message}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
