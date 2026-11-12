export const StatCard = ({ title, value, icon: Icon, change, trend = 'neutral', color = 'primary' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {change && (
          <span className={`stat-card-trend trend-${trend}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
