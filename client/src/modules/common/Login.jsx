import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useToast } from './Toast';
import PageTransition from './PageTransition';
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
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Email || !formData.Password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/login', formData);
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      showToast(`Welcome back, ${userData.Name}!`, 'success');

      // Role-based redirection
      if (userData.UserType === 'Tenant') {
        navigate('/renter');
      } else if (userData.UserType === 'Owner') {
        navigate('/owner');
      } else if (userData.UserType === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Login failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
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
                Sign In to HouseHunt
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                Find properties or manage listings
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    variant="outlined"
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
                
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.Password}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'var(--text-muted)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ textEnd: 'right', mb: 3 }}>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: 'var(--accent-color)', 
                      fontSize: '0.875rem', 
                      textDecoration: 'none',
                      fontWeight: '500' 
                    }}
                  >
                    Forgot Password?
                  </Link>
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      color: 'var(--accent-color)', 
                      fontWeight: '600', 
                      textDecoration: 'none' 
                    }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </div>
    </PageTransition>
  );
};

export default Login;
