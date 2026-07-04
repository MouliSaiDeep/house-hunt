import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
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
import { HomeWork, CalendarMonth, Add, Warning } from '@mui/icons-material';

const OwnerHome = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalListings: 0, pendingInquiries: 0 });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { showToast } = useToast();

  useEffect(() => {
    if (user.isApproved) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const propertiesRes = await api.get('/owner/properties');
      const bookingsRes = await api.get('/owner/bookings');
      
      const pendingCount = bookingsRes.data.filter(b => b.Status === 'Pending').length;
      
      setStats({
        totalListings: propertiesRes.data.length,
        pendingInquiries: pendingCount
      });
    } catch (error) {
      console.error(error);
      showToast('Error loading landlord statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
            Landlord Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            Manage your rental listings and confirm tenant inquiries.
          </Typography>
        </Box>

        {/* Admin Approval Pending Check */}
        {!user.isApproved && (
          <Box className="alert alert-danger d-flex align-items-center gap-3 p-4 mb-4" sx={{ borderRadius: 'var(--radius-md)' }}>
            <Warning sx={{ fontSize: '32px' }} />
            <div>
              <Typography variant="h6" sx={{ fontWeight: '700', fontSize: '1.05rem', mb: 0.5 }}>
                Approval Pending
              </Typography>
              <Typography variant="body2">
                Your landlord profile is awaiting review by a system administrator. You will gain listing permissions, edit controls, and tenant inquiry management tools once your account is toggled to approved status.
              </Typography>
            </div>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      My Properties
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: '800', mt: 1 }}>
                      {stats.totalListings}
                    </Typography>
                  </div>
                  <HomeWork sx={{ fontSize: 50, color: 'var(--accent-color)' }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      Pending Inquiries
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: '800', mt: 1 }}>
                      {stats.pendingInquiries}
                    </Typography>
                  </div>
                  <CalendarMonth sx={{ fontSize: 50, color: 'var(--accent-color)' }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions Panel */}
            {user.isApproved && (
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', bgcolor: '#F8FAFC', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: '700', mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      component={Link}
                      to="/owner/add-property"
                      variant="contained"
                      startIcon={<Add />}
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
                      Add New Listing
                    </Button>
                    <Button
                      component={Link}
                      to="/owner/properties"
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
                      Manage Properties
                    </Button>
                    <Button
                      component={Link}
                      to="/owner/bookings"
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
                      Review Inquiries
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default OwnerHome;
