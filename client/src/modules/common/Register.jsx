import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useToast } from './Toast';
import api from '../../utils/api';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Person, Email, Phone, Lock, LocationOn, PhotoCamera } from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Password: '',
    UserType: 'Tenant',
    CurrentLocation: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { Name, Email, Phone, Password, UserType } = formData;
    
    if (!Name || !Email || !Phone || !Password || !UserType) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    
    // Build FormData object for file uploading
    const data = new FormData();
    data.append('Name', Name);
    data.append('Email', Email);
    data.append('Phone', Phone);
    data.append('Password', Password);
    data.append('UserType', UserType);
    data.append('CurrentLocation', formData.CurrentLocation);
    if (profileImage) {
      data.append('ProfileImage', profileImage);
    }

    try {
      const response = await api.post('/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.UserType === 'Owner') {
        showToast('Registration successful! Your owner account is pending Admin approval.', 'success');
        navigate('/owner');
      } else {
        showToast(`Registration successful! Welcome, ${userData.Name}!`, 'success');
        navigate('/renter');
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper d-flex align-items-center justify-content-center py-5">
        <Container maxWidth="sm">
          <Card 
            sx={{ 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'var(--primary-color)', 
                color: 'white', 
                py: 3, 
                px: 4, 
                textAlign: 'center' 
              }}
            >
              <Typography variant="h5" component="h2" sx={{ fontWeight: '800', fontFamily: 'Manrope' }}>
                Join HouseHunt
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                Create an account to browse homes or host rentals
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="Password"
                    type="password"
                    value={formData.Password}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Account Type *"
                    name="UserType"
                    value={formData.UserType}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="Tenant">Renter / Tenant</MenuItem>
                    <MenuItem value="Owner">Property Owner / Landlord</MenuItem>
                  </TextField>
                </Box>

                {formData.UserType === 'Owner' && (
                  <Box className="alert alert-warning py-2 mb-3" sx={{ fontSize: '0.85rem' }}>
                    <strong>Note for Landlords:</strong> Your profile requires approval from an Admin before you can publish properties.
                  </Box>
                )}

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Current Location"
                    name="CurrentLocation"
                    value={formData.CurrentLocation}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1, fontWeight: '500' }}>
                    Profile Picture
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={loading}
                    startIcon={<PhotoCamera />}
                    sx={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                      py: 1.25,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'var(--accent-color)'
                      }
                    }}
                  >
                    {profileImage ? profileImage.name : 'Upload Profile Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: 'var(--primary-color)',
                    color: 'white',
                    py: 1.5,
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '600',
                    fontFamily: 'Manrope',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'var(--primary-light)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: 'var(--accent-color)', 
                      fontWeight: '600', 
                      textDecoration: 'none' 
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Register;
