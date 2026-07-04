import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useToast } from './Toast';
import PageTransition from './PageTransition';
import api from '../../utils/api';
import { 
  Person, 
  Email, 
  Phone, 
  Lock, 
  LocationOn, 
  PhotoCamera,
  Google,
  GitHub
} from '@mui/icons-material';

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
  const [shake, setShake] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { Name, Email, Phone, Password, UserType } = formData;
    
    if (!Name || !Email || !Phone || !Password || !UserType) {
      showToast('Please fill in all required fields', 'error');
      triggerShake();
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
          style={{ maxWidth: '460px' }}
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
                Create Account
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Join HouseHunt as a renter or property owner
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <Person style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type="text"
                    name="Name"
                    required
                    placeholder="John Doe"
                    value={formData.Name}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Address *
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

              {/* Phone Number */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type="tel"
                    name="Phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.Phone}
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
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type="password"
                    name="Password"
                    required
                    placeholder="••••••••"
                    value={formData.Password}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              {/* Account Type */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Account Type *
                </label>
                <select
                  name="UserType"
                  value={formData.UserType}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="Tenant">Renter / Tenant</option>
                  <option value="Owner">Property Owner / Landlord</option>
                </select>
              </div>

              {formData.UserType === 'Owner' && (
                <div 
                  className="p-3 mb-3 rounded"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    color: 'var(--warning)',
                    fontSize: '0.75rem',
                    lineHeight: '1.4'
                  }}
                >
                  <strong>Notice for Landlords:</strong> Your profile requires approval from an Admin before you can publish properties.
                </div>
              )}

              {/* Location */}
              <div className="mb-3">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Current Location
                </label>
                <div style={{ position: 'relative' }}>
                  <LocationOn style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                  <input 
                    type="text"
                    name="CurrentLocation"
                    placeholder="City, State"
                    value={formData.CurrentLocation}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              {/* Profile Image upload button */}
              <div className="mb-4">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Profile Picture
                </label>
                <div className="w-100">
                  <label 
                    className="btn-househunt-outline w-100 py-3"
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <PhotoCamera style={{ fontSize: '18px' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                      {profileImage ? profileImage.name : 'Upload profile picture'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-househunt-primary w-100 py-3"
                style={{ borderRadius: '8px' }}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
              <Link 
                to="/login" 
                className="hover-underline-link"
                style={{ color: 'var(--accent)', fontWeight: 600 }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;
