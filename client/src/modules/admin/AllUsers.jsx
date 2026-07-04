import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
import { Delete, ToggleOn, ToggleOff, AccountCircle } from '@mui/icons-material';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const currentAdmin = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  })();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading platform users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (user) => {
    const actionText = user.isApproved ? 'revoke approval' : 'approve';
    if (!window.confirm(`Are you sure you want to ${actionText} this Owner account?`)) return;

    try {
      await api.put(`/admin/approve-owner/${user._id}`);
      showToast(`Owner approval updated successfully`, 'success');
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast('Failed to update owner approval', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentAdmin._id) {
      showToast('You cannot delete your own admin account', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user permanently? This will remove all their data.')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      showToast('User deleted successfully', 'success');
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      console.error(error);
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="mb-5">
            <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
              System Users
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
              Review, approve owner credentials, or deactivate user accounts.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : (
            <div 
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div className="table-responsive">
                <table className="table m-0">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th className="p-3 border-0">User Profile</th>
                      <th className="p-3 border-0">Email</th>
                      <th className="p-3 border-0">Phone</th>
                      <th className="p-3 border-0">Role Type</th>
                      <th className="p-3 border-0">Owner Status</th>
                      <th className="p-3 border-0">Verify Action</th>
                      <th className="p-3 border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{ verticalAlign: 'middle' }}>
                        <td className="p-3">
                          <div className="d-flex align-items-center gap-3">
                            {user.ProfileImage ? (
                              <img 
                                src={`http://localhost:5000${user.ProfileImage}`} 
                                alt={user.Name} 
                                style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }}
                              />
                            ) : (
                              <AccountCircle style={{ fontSize: '36px', color: 'var(--text-muted)' }} />
                            )}
                            <div>
                              <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {user.Name}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Location: {user.CurrentLocation || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>{user.Email}</td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>{user.Phone}</td>
                        <td className="p-3">
                          <span className={`status-badge ${user.UserType.toLowerCase()}`}>
                            {user.UserType}
                          </span>
                        </td>
                        <td className="p-3">
                          {user.UserType === 'Owner' ? (
                            <span className={`status-badge ${user.isApproved ? 'confirmed' : 'pending'}`}>
                              {user.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>N/A (Auto-approved)</span>
                          )}
                        </td>
                        <td className="p-3">
                          {user.UserType === 'Owner' ? (
                            <button
                              onClick={() => handleToggleApproval(user)}
                              className="btn btn-sm text-decoration-none d-inline-flex align-items-center gap-1 p-0 text-success"
                              style={{ fontSize: '0.8rem', fontWeight: 600, border: 'none', background: 'transparent' }}
                            >
                              {user.isApproved ? <ToggleOn style={{ fontSize: '24px' }} /> : <ToggleOff style={{ fontSize: '24px', color: 'var(--text-muted)' }} />}
                              {user.isApproved ? 'Revoke Approval' : 'Approve Owner'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td className="p-3 text-end">
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user._id === currentAdmin._id}
                            className="btn btn-sm btn-outline-danger p-1"
                            style={{ display: 'inline-flex', borderRadius: '4px' }}
                          >
                            <Delete style={{ fontSize: '16px' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllUsers;
