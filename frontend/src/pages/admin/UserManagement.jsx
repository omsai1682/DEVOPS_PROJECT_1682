import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Users, Search, Shield, UserCheck, UserX, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('customer');
  const [editActive, setEditActive] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch (err) {
      notifyError('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEdit = (u) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setEditActive(u.isActive);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      await userService.update(selectedUser._id, {
        role: editRole,
        isActive: editActive
      });
      notifySuccess(`User ${selectedUser.email} updated successfully!`);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      notifyError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserStatus = async (u) => {
    if (u._id === currentUser?._id || u._id === currentUser?.id) {
      notifyError('You cannot deactivate your own administrative account');
      return;
    }

    try {
      await userService.update(u._id, { isActive: !u.isActive });
      notifySuccess(`User ${u.name} ${!u.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      notifyError(err.message || 'Status update failed');
    }
  };

  const handleDeleteUser = async (u) => {
    if (u._id === currentUser?._id || u._id === currentUser?.id) {
      notifyError('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${u.name}?`)) return;

    try {
      await userService.delete(u._id);
      notifySuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      notifyError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch =
      searchTerm === '' ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner text="Fetching user credentials and roles..." />;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise User & Role Management</h1>
          <p className="page-subtitle">Configure role permissions, active account statuses, and profiles</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by name, email, or telephone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="font-semibold">{u.name}</div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</span>
                    </td>
                    <td>
                      <span className={`user-role-tag role-${u.role}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{u.phone || 'N/A'}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.address || 'No address'}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(u)}
                          title="Edit User Role"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-success'}`}
                          style={u.isActive ? { color: 'var(--warning)', borderColor: '#fcd34d' } : {}}
                          onClick={() => toggleUserStatus(u)}
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteUser(u)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role & Status Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Role: ${selectedUser?.name}`}
      >
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label className="form-label">Assign System Role</label>
            <select
              className="form-control"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="customer">Customer (Storefront, Rentals, Tracking)</option>
              <option value="inventory_manager">Inventory Manager (Stock, Quality Inspections)</option>
              <option value="admin">System Admin (Full Access, Revenue, Users)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account Active Status</label>
            <select
              className="form-control"
              value={editActive ? 'true' : 'false'}
              onChange={(e) => setEditActive(e.target.value === 'true')}
            >
              <option value="true">Active (Can log in & transact)</option>
              <option value="false">Deactivated (Access blocked)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => setEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save User Permissions'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
