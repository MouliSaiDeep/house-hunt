import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useToast } from './Toast';
import PageTransition from './PageTransition';
import { Email, ArrowBack } from '@mui/icons-material';

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
          className="w-100"
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
                Reset Password
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Provide your email to receive a recovery link
              </p>
            </div>
            
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                {/* Email Address */}
                <div className="mb-4">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Email style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                    <input 
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '48px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-househunt-primary w-100 py-3"
                  style={{ borderRadius: '8px' }}
                >
                  Send Reset Link
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '24px', lineHeight: '1.6' }}>
                  A simulated password reset email has been sent to <strong style={{ color: 'var(--accent)' }}>{email}</strong>.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>
                  In a production environment, this would contain a secure token link to reset your password.
                </p>
                <Link
                  to="/login"
                  className="btn-househunt-outline w-100 py-3"
                  style={{ borderRadius: '8px' }}
                >
                  <ArrowBack style={{ fontSize: '16px', marginRight: '6px' }} />
                  Return to Sign In
                </Link>
              </div>
            )}

            {!submitted && (
              <div className="text-center mt-4" style={{ fontSize: '0.8rem' }}>
                <Link 
                  to="/login" 
                  className="hover-underline-link"
                  style={{ fontWeight: 600 }}
                >
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
