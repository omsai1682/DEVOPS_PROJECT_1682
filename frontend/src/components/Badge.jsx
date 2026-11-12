export const Badge = ({ status, variant }) => {
  const getBadgeClass = (val) => {
    if (variant) return `badge-${variant}`;
    const s = String(val || '').toLowerCase();
    if (['available', 'confirmed', 'paid', 'accepted', 'active', 'excellent', 'new'].includes(s)) {
      return 'badge-success';
    }
    if (['pending', 'dispatched', 'return requested', 'pending inspection', 'good'].includes(s)) {
      return 'badge-warning';
    }
    if (['overdue', 'cancelled', 'rejected', 'damaged', 'unavailable'].includes(s)) {
      return 'badge-danger';
    }
    if (['returned', 'maintenance', 'under maintenance', 'fair'].includes(s)) {
      return 'badge-info';
    }
    return 'badge-neutral';
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status || 'N/A'}</span>;
};

export default Badge;
