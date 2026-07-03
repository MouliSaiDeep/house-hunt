import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useToast } from './Toast';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import { Email } from '@mui/icons-material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    // Simulate API request
    setSubmitted(true);
    showToast(`Password reset link sent to ${email} (Simulated)`, 'success');
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
                Reset Password
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                Provide your email to receive a recovery link
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'var(--text-muted)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
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
                    Send Reset Link
                  </Button>
                </form>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" sx={{ color: 'var(--text-main)', mb: 3, fontWeight: '500' }}>
                    A simulated password reset email has been sent to <strong>{email}</strong>.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 3 }}>
                    In a production environment, this would contain a secure token link to reset your password.
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: 'var(--primary-color)',
                      color: 'var(--primary-color)',
                      fontWeight: '600',
                      textTransform: 'none',
                      px: 4,
                      '&:hover': {
                        borderColor: 'var(--primary-light)',
                        bgcolor: 'rgba(15, 23, 42, 0.04)'
                      }
                    }}
                  >
                    Return to Sign In
                  </Button>
                </Box>
              )}

              {!submitted && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Remember your password?{' '}
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
              )}
            </CardContent>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default ForgotPassword;
