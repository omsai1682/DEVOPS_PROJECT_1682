export const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner-circle"></div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
