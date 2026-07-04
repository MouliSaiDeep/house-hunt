import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useToast } from './Toast';
import PageTransition from './PageTransition';
import api from '../../utils/api';
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff,
  Google,
  GitHub
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Email || !formData.Password) {
      showToast('Please enter both email and password', 'error');
      triggerShake();
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
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div 
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'var(--bg-primary)',
          padding: '40px 16px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`w-100 ${shake ? 'animate-shake' : ''}`}
          style={{ maxWidth: '420px' }}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px 0' }}>
                Sign In
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Find properties or manage listings
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Email style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type="email"
                    name="Email"
                    required
                    placeholder="email@example.com"
                    value={formData.Email}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="Password"
                    required
                    placeholder="••••••••"
                    value={formData.Password}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control"
                    style={{ paddingLeft: '48px', paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <VisibilityOff style={{ fontSize: '18px' }} /> : <Visibility style={{ fontSize: '18px' }} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-end mb-4">
                <Link 
                  to="/forgot-password" 
                  className="hover-underline-link"
                  style={{ fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-househunt-primary w-100 py-3"
                style={{ borderRadius: '8px' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Social Divider */}
            <div className="d-flex align-items-center my-4" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }} />
              <span className="mx-2 text-uppercase" style={{ letterSpacing: '0.05em' }}>or continue with</span>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            </div>

            {/* Social Logins */}
            <div className="d-flex gap-2 justify-content-center">
              <button 
                type="button" 
                className="btn-househunt-outline px-3 py-2 flex-grow-1"
                style={{ fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={() => showToast('Social authentication is currently disabled', 'warning')}
              >
                <Google style={{ fontSize: '16px', marginRight: '6px' }} />
                Google
              </button>
              <button 
                type="button" 
                className="btn-househunt-outline px-3 py-2 flex-grow-1"
                style={{ fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={() => showToast('Social authentication is currently disabled', 'warning')}
              >
                <GitHub style={{ fontSize: '16px', marginRight: '6px' }} />
                GitHub
              </button>
            </div>

            <div className="text-center mt-4" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
              <Link 
                to="/register" 
                className="hover-underline-link"
                style={{ color: 'var(--accent)', fontWeight: 600 }}
              >
                Register
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
