import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../utils/api';
import PageTransition from './PageTransition';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress
} from '@mui/material';
import { Search, LocationOn, AttachMoney, HomeWork } from '@mui/icons-material';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Fetch available properties
      const response = await api.get('/properties');
      setProperties(response.data.slice(0, 6)); // Show first 6 properties
    } catch (error) {
      console.error('Error fetching properties on landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(`/renter/properties?location=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'var(--primary-color)', 
          color: 'white', 
          py: { xs: 8, md: 12 }, 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: '800', 
                  fontFamily: 'Manrope',
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  lineHeight: 1.15,
                  mb: 2
                }}
              >
                Find a Home that <span style={{ color: 'var(--accent-color)' }}>Inspires</span> You.
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontWeight: '400',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Discover premium rental apartments, studios, and houses in your favorite neighborhoods. Safe, simple, and direct.
              </Typography>
              
              {/* Search Form */}
              <Box 
                component="form" 
                onSubmit={handleSearchSubmit}
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  bgcolor: 'white',
                  p: 1,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Enter location (e.g. New York, Hyderabad)"
                  variant="standard"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: <LocationOn sx={{ color: 'var(--text-muted)', mr: 1 }} />,
                    style: { height: '50px', paddingLeft: '10px', color: 'var(--text-main)' }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained"
                  startIcon={<Search />}
                  sx={{ 
                    bgcolor: 'var(--accent-color)', 
                    color: 'white',
                    px: 4,
                    py: { xs: 1.5, sm: 0 },
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'Manrope',
                    fontWeight: '600',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'var(--accent-hover)'
                    }
                  }}
                >
                  Search
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5} className="d-none d-md-block text-center">
              <Box 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)', 
                  p: 4, 
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <HomeWork sx={{ fontSize: '100px', color: 'var(--accent-color)', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                  List Your Property
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                  Are you a landlord? Reach verified renters and manage bookings in one dashboard.
                </Typography>
                <Button 
                  component={Link} 
                  to="/register"
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    fontFamily: 'Manrope',
                    textTransform: 'none',
                    fontWeight: '600',
                    px: 3,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Join as Owner
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Properties */}
      <Container sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: '800', mb: 1 }}>
            Featured Properties
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: '600px', mx: 'auto' }}>
            Check out some of our newly listed home rentals on the platform.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : properties.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', bgcolor: 'white' }}>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No properties listed yet. Check back soon!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <Card 
                  className="househunt-card h-100 d-flex flex-column"
                  sx={{ height: '100%' }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.Images && property.Images[0] ? `http://localhost:5000${property.Images[0]}` : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'}
                    alt={property.Title}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={property.PropertyType} size="small" sx={{ bgcolor: 'var(--primary-light)', color: 'white', fontWeight: '500' }} />
                      <Typography variant="h6" color="primary" sx={{ fontWeight: '800', color: 'var(--accent-color)' }}>
                        ${property.RentAmount}/mo
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: '700', mb: 1, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                      {property.Title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" className="d-flex align-items-center mb-3">
                      <LocationOn sx={{ fontSize: '16px', mr: 0.5, color: 'var(--text-muted)' }} />
                      {property.Location}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {property.Description}
                    </Typography>

                    <Button
                      fullWidth
                      component={Link}
                      to={localStorage.getItem('token') ? (JSON.parse(localStorage.getItem('user') || '{}').UserType === 'Tenant' ? `/renter` : `/login`) : `/login`}
                      variant="contained"
                      sx={{
                        bgcolor: 'var(--primary-color)',
                        color: 'white',
                        textTransform: 'none',
                        fontFamily: 'Manrope',
                        fontWeight: '600',
                        py: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'var(--primary-light)',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Get Info
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            component={Link} 
            to={localStorage.getItem('token') ? "/renter/properties" : "/login"}
            variant="outlined" 
            sx={{ 
              borderColor: 'var(--primary-color)', 
              color: 'var(--primary-color)',
              fontWeight: '600',
              fontFamily: 'Manrope',
              textTransform: 'none',
              px: 4,
              '&:hover': {
                borderColor: 'var(--primary-light)',
                bgcolor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Browse All Properties
          </Button>
        </Box>
      </Container>
    </PageTransition>
  );
};

export default Home;
