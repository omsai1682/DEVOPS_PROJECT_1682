import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', message, title, children }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-icon">{getIcon()}</div>
      <div className="alert-content">
        {title && <h5 className="alert-title">{title}</h5>}
        {message && <p className="alert-message">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default Alert;
