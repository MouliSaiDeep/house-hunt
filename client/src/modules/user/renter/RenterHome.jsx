import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import { Delete, History, Search, Analytics, School, DirectionsBus, Security, Shield } from '@mui/icons-material';
import moment from 'moment';

const RenterHome = () => {
  const [bookings, setBookings] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marketTrends, setMarketTrends] = useState([]);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tenant Bookings
      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data);

      // 2. Fetch Saved Searches
      const searchesRes = await api.get('/users/saved-searches');
      setSavedSearches(searchesRes.data);

      // 3. Fetch View History
      const historyRes = await api.get('/bookings/history');
      setViewHistory(historyRes.data);

      // 4. Fetch All properties to derive local market trends (avg rent per location)
      const propertiesRes = await api.get('/properties');
      deriveMarketTrends(propertiesRes.data);

    } catch (error) {
      console.error('Error fetching renter dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deriveMarketTrends = (properties) => {
    const locations = {};
    properties.forEach(p => {
      if (!locations[p.Location]) {
        locations[p.Location] = { total: 0, count: 0 };
      }
      locations[p.Location].total += p.RentAmount;
      locations[p.Location].count += 1;
    });

    const trends = Object.keys(locations).map(loc => ({
      location: loc,
      avgRent: Math.round(locations[loc].total / locations[loc].count),
      count: locations[loc].count
    }));

    setMarketTrends(trends);
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking inquiry?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      showToast('Booking cancelled successfully', 'success');
      // Reload bookings
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to cancel booking', 'error');
    }
  };

  const handleDeleteSavedSearch = async (searchId, e) => {
    e.stopPropagation(); // Avoid triggering search click
    try {
      await api.delete(`/users/saved-searches/${searchId}`);
      showToast('Saved search deleted', 'success');
      setSavedSearches(savedSearches.filter(s => s._id !== searchId));
    } catch (error) {
      console.error(error);
      showToast('Failed to delete saved search', 'error');
    }
  };

  const handleApplySavedSearch = (query) => {
    // Build query params
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key]) {
        params.append(key, query[key]);
      }
    });
    navigate(`/renter/properties?${params.toString()}`);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
            Tenant Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            Track your rental inquiries, saved searches, and local rent trends.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Main Content Area */}
            <Grid item xs={12} lg={8}>
              {/* My Booking Inquiries */}
              <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', mb: 4, boxShadow: 'var(--shadow-sm)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: '700' }}>
                    My Inquiries & Bookings
                  </Typography>
                  <Button component={Link} to="/renter/properties" variant="contained" size="small" sx={{ bgcolor: 'var(--primary-color)', textTransform: 'none', fontWeight: '600' }}>
                    Browse Properties
                  </Button>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  {bookings.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        You have not submitted any inquiries yet.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: '600' }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Rent</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Dates</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                  {booking.PropertyID?.Title || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {booking.PropertyID?.Location}
                                </Typography>
                              </TableCell>
                              <TableCell>${booking.PropertyID?.RentAmount}/mo</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                  {moment(booking.StartDate).format('DD MMM YYYY')} to
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                  {moment(booking.EndDate).format('DD MMM YYYY')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={booking.Status} 
                                  size="small" 
                                  color={getStatusChipColor(booking.Status)}
                                  sx={{ fontWeight: '600' }}
                                />
                              </TableCell>
                              <TableCell>
                                {booking.Status === 'Pending' ? (
                                  <Button 
                                    color="error" 
                                    size="small" 
                                    onClick={() => handleCancelBooking(booking._id)}
                                    sx={{ textTransform: 'none', fontWeight: '600' }}
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>

              {/* Market Insights & Local Trends */}
              <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', mb: 4 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)' }}>
                  <Typography variant="h6" sx={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics color="primary" /> Market Insights & Rent Trends
                  </Typography>
                </Box>
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    Average rental rates calculated directly from listings available in each area:
                  </Typography>
                  
                  {marketTrends.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      No trend data available.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {marketTrends.map((trend, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Box sx={{ p: 2.5, bgcolor: '#F1F5F9', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                              {trend.location}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: '800', color: 'var(--primary-color)', my: 0.5 }}>
                              ${trend.avgRent} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ mo average</span>
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                              Based on {trend.count} listing(s)
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <Divider sx={{ my: 4 }} />
                  
                  <Typography variant="h6" sx={{ fontWeight: '700', mb: 2, fontSize: '1rem' }}>
                    Neighborhood Safety & Services
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                        <School sx={{ fontSize: 32, color: 'var(--text-muted)', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', color: 'var(--text-main)' }}>Local Schools</Typography>
                        <Chip label="Coming Soon" size="small" variant="outlined" sx={{ mt: 1, height: '20px', fontSize: '0.65rem' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                        <DirectionsBus sx={{ fontSize: 32, color: 'var(--text-muted)', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', color: 'var(--text-main)' }}>Public Transport</Typography>
                        <Chip label="Coming Soon" size="small" variant="outlined" sx={{ mt: 1, height: '20px', fontSize: '0.65rem' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                        <Security sx={{ fontSize: 32, color: 'var(--text-muted)', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', color: 'var(--text-main)' }}>Crime Stats</Typography>
                        <Chip label="Coming Soon" size="small" variant="outlined" sx={{ mt: 1, height: '20px', fontSize: '0.65rem' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar Columns (Saved Searches & Viewing History) */}
            <Grid item xs={12} lg={4}>
              {/* Saved Searches */}
              <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', mb: 4, boxShadow: 'var(--shadow-sm)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: '700' }}>
                    Saved Searches
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  {savedSearches.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No saved searches yet.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {savedSearches.map((search) => (
                        <React.Fragment key={search._id}>
                          <ListItem 
                            button
                            onClick={() => handleApplySavedSearch(search.query)}
                            secondaryAction={
                              <IconButton edge="end" onClick={(e) => handleDeleteSavedSearch(search._id, e)} color="error" size="small">
                                <Delete fontSize="small" />
                              </IconButton>
                            }
                            sx={{ py: 2 }}
                          >
                            <ListItemText 
                              primary={search.name} 
                              secondary={Object.keys(search.query || {}).map(k => `${k}: ${search.query[k]}`).join(', ') || 'All Locations'}
                              primaryTypographyProps={{ fontWeight: '600', fontSize: '0.95rem' }}
                              secondaryTypographyProps={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* Viewing History */}
              <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: '700' }}>
                    Recently Viewed
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  {viewHistory.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No viewing history found.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {viewHistory.map((item, index) => {
                        const prop = item.PropertyID;
                        if (!prop) return null;
                        return (
                          <React.Fragment key={index}>
                            <ListItem 
                              button
                              component={Link}
                              to={`/renter/properties?info=${prop._id}`}
                              sx={{ py: 2 }}
                            >
                              <ListItemText 
                                primary={prop.Title} 
                                secondary={`${prop.Location} • $${prop.RentAmount}/mo`}
                                primaryTypographyProps={{ fontWeight: '600', fontSize: '0.9rem' }}
                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default RenterHome;
