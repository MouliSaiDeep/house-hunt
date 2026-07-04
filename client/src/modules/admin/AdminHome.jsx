import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import { People, HomeWork, CalendarMonth, Shield } from '@mui/icons-material';

const AdminHome = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalProperties: 0, totalBookings: 0 });
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const propertiesRes = await api.get('/admin/properties');
      const bookingsRes = await api.get('/admin/bookings');

      setStats({
        totalUsers: usersRes.data.length,
        totalProperties: propertiesRes.data.length,
        totalBookings: bookingsRes.data.length
      });
    } catch (error) {
      console.error(error);
      showToast('Error loading platform statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Shield sx={{ fontSize: 36, color: 'var(--accent-color)' }} />
          <div>
            <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
              Admin Moderation Center
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
              Monitor system listings, moderate user accounts, and approve landlords.
            </Typography>
          </div>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      Registered Users
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: '800', mt: 1 }}>
                      {stats.totalUsers}
                    </Typography>
                  </div>
                  <People sx={{ fontSize: 50, color: 'var(--accent-color)' }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      Active Properties
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: '800', mt: 1 }}>
                      {stats.totalProperties}
                    </Typography>
                  </div>
                  <HomeWork sx={{ fontSize: 50, color: 'var(--accent-color)' }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      Total Bookings
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: '800', mt: 1 }}>
                      {stats.totalBookings}
                    </Typography>
                  </div>
                  <CalendarMonth sx={{ fontSize: 50, color: 'var(--accent-color)' }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions Panel */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', bgcolor: '#F8FAFC', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: '700', mb: 3 }}>
                  Moderation Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/admin/users"
                    variant="contained"
                    sx={{
                      bgcolor: 'var(--primary-color)',
                      color: 'white',
                      textTransform: 'none',
                      fontFamily: 'Manrope',
                      fontWeight: '600',
                      px: 3,
                      py: 1.25,
                      '&:hover': { bgcolor: 'var(--primary-light)' }
                    }}
                  >
                    Manage Users & Landlords
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/properties"
                    variant="outlined"
                    sx={{
                      borderColor: 'var(--primary-color)',
                      color: 'var(--primary-color)',
                      textTransform: 'none',
                      fontFamily: 'Manrope',
                      fontWeight: '600',
                      px: 3,
                      py: 1.25,
                      '&:hover': { borderColor: 'var(--primary-light)', bgcolor: 'rgba(15, 23, 42, 0.04)' }
                    }}
                  >
                    Moderate Properties
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/bookings"
                    variant="outlined"
                    sx={{
                      borderColor: 'var(--primary-color)',
                      color: 'var(--primary-color)',
                      textTransform: 'none',
                      fontFamily: 'Manrope',
                      fontWeight: '600',
                      px: 3,
                      py: 1.25,
                      '&:hover': { borderColor: 'var(--primary-light)', bgcolor: 'rgba(15, 23, 42, 0.04)' }
                    }}
                  >
                    View System Bookings
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default AdminHome;
