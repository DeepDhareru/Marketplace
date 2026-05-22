import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FiBell } from 'react-icons/fi';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleClick = async (notification) => {
    try {
      await API.put(`/notifications/${notification._id}/read`);
      setNotifications(notifications.map((n) =>
        n._id === notification._id ? { ...n, isRead: true } : n
      ));
      if (notification.link) navigate(notification.link);
      setOpen(false);
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch {}
  };

  const TYPE_ICONS = {
    order: '📦',
    payment: '💳',
    review: '⭐',
    system: '🔔',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1"
      >
        <FiBell size={22} className="text-gray-700 dark:text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Notifications
              {unread > 0 && (
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 last:border-0 ${
                    !n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="text-xl mt-0.5">{TYPE_ICONS[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    className="text-gray-300 hover:text-red-400 text-sm self-start"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationBell;