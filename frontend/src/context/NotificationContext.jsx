import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notifySuccess = useCallback((msg) => addNotification(msg, 'success'), [addNotification]);
  const notifyError = useCallback((msg) => addNotification(msg, 'error', 5000), [addNotification]);
  const notifyInfo = useCallback((msg) => addNotification(msg, 'info'), [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        notifySuccess,
        notifyError,
        notifyInfo
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {notifications.map((n) => (
          <div key={n.id} className={`toast-item toast-${n.type}`}>
            <span className="toast-message">{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
