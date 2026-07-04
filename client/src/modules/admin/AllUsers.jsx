import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Delete, ToggleOn, ToggleOff, AccountCircle } from '@mui/icons-material';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const currentAdmin = JSON.parse(localStorage.getItem('user') || '{}');

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
      // Reload users list
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
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
            System Users
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            Review, approve owner credentials, or deactivate user accounts.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>User Profile</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Role Type</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Owner Status</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Verify Action</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {user.ProfileImage ? (
                          <img 
                            src={`http://localhost:5000${user.ProfileImage}`} 
                            alt={user.Name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <AccountCircle sx={{ fontSize: '40px', color: 'var(--text-muted)' }} />
                        )}
                        <div>
                          <Typography variant="body2" sx={{ fontWeight: '600' }}>
                            {user.Name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Location: {user.CurrentLocation || 'N/A'}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.Phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.UserType} 
                        size="small"
                        sx={{ 
                          bgcolor: user.UserType === 'Admin' ? 'var(--primary-color)' : user.UserType === 'Owner' ? 'var(--accent-light)' : '#E2E8F0',
                          color: user.UserType === 'Admin' ? 'white' : user.UserType === 'Owner' ? 'var(--accent-hover)' : 'var(--text-main)',
                          fontWeight: '600'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {user.UserType === 'Owner' ? (
                        <Chip 
                          label={user.isApproved ? 'Approved' : 'Pending'} 
                          size="small"
                          color={user.isApproved ? 'success' : 'warning'}
                          sx={{ fontWeight: '600' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">N/A (Auto-approved)</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.UserType === 'Owner' ? (
                        <Button
                          size="small"
                          startIcon={user.isApproved ? <ToggleOn /> : <ToggleOff />}
                          onClick={() => handleToggleApproval(user)}
                          color={user.isApproved ? 'success' : 'warning'}
                          sx={{ textTransform: 'none', fontWeight: '600' }}
                        >
                          {user.isApproved ? 'Revoke Approval' : 'Approve Owner'}
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={user._id === currentAdmin._id}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default AllUsers;
