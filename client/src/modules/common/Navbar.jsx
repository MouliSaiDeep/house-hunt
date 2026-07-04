import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Close, Logout, AccountCircle, Apartment } from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  })();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const links = [
    { label: 'Home', path: '/' },
  ];

  if (token && user.UserType === 'Tenant') {
    links.push({ label: 'Dashboard', path: '/renter' });
    links.push({ label: 'Browse', path: '/renter/properties' });
  } else if (token && user.UserType === 'Owner') {
    links.push({ label: 'Dashboard', path: '/owner' });
    links.push({ label: 'My Properties', path: '/owner/properties' });
    links.push({ label: 'Bookings', path: '/owner/bookings' });
    links.push({ label: 'Add Property', path: '/owner/add-property' });
  } else if (token && user.UserType === 'Admin') {
    links.push({ label: 'Dashboard', path: '/admin' });
    links.push({ label: 'Users', path: '/admin/users' });
    links.push({ label: 'Properties', path: '/admin/properties' });
    links.push({ label: 'Bookings', path: '/admin/bookings' });
  }

  return (
    <>
      <nav 
        className="navbar navbar-expand-lg navbar-dark fixed-top" 
        style={{
          height: '64px',
          background: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.7)' : 'none',
          zIndex: 50,
          padding: '0'
        }}
      >
        <div className="container h-100 d-flex align-items-center justify-content-between">
          <Link 
            className="navbar-brand d-flex align-items-center gap-2" 
            to="/" 
            style={{ 
              fontFamily: 'var(--font-family)', 
              fontWeight: 700, 
              fontSize: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)'
            }}
          >
            <Apartment style={{ color: 'var(--accent)', fontSize: '24px' }} />
            <span>house-hunt</span>
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.path}
                className="hover-underline-link"
                to={link.path}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: isActive(link.path) ? 'var(--accent)' : 'var(--text-secondary)'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right Action buttons */}
          <div className="d-none d-lg-flex align-items-center gap-3">
            {token ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <span className="d-block" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.Name}
                  </span>
                  <span className="d-block" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    {user.UserType}
                  </span>
                </div>
                
                {user.ProfileImage ? (
                  <img 
                    src={user.ProfileImage.startsWith('http') ? user.ProfileImage : `http://localhost:5000${user.ProfileImage}`} 
                    alt="profile" 
                    className="rounded-circle border"
                    width="36" 
                    height="36"
                    style={{ objectFit: 'cover', borderColor: 'var(--border)' }}
                  />
                ) : (
                  <AccountCircle style={{ color: 'var(--text-secondary)', fontSize: '36px' }} />
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="btn-househunt-outline" 
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Logout style={{ fontSize: '14px' }} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link 
                  className="btn-househunt-outline" 
                  to="/login"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Login
                </Link>
                <Link 
                  className="btn-househunt-primary" 
                  to="/register"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Hamburger button for mobile */}
          <button 
            className="d-lg-none bg-transparent border-0 text-white p-2" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation"
          >
            <Menu style={{ fontSize: '28px' }} />
          </button>
        </div>
      </nav>
      
      {/* Spacer to push content down since navbar is fixed */}
      <div style={{ height: '64px' }}></div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000000',
                zIndex: 100
              }}
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '280px',
                height: '100vh',
                backgroundColor: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border)',
                zIndex: 101,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>menu</span>
                  <button 
                    className="bg-transparent border-0 text-white p-1" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Close style={{ fontSize: '24px' }} />
                  </button>
                </div>
                
                {/* Mobile User Profile info */}
                {token && (
                  <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    {user.ProfileImage ? (
                      <img 
                        src={user.ProfileImage.startsWith('http') ? user.ProfileImage : `http://localhost:5000${user.ProfileImage}`} 
                        alt="profile" 
                        className="rounded-circle border"
                        width="36" 
                        height="36"
                        style={{ objectFit: 'cover', borderColor: 'var(--border)' }}
                      />
                    ) : (
                      <AccountCircle style={{ color: 'var(--text-secondary)', fontSize: '36px' }} />
                    )}
                    <div>
                      <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.Name}</span>
                      <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{user.UserType}</span>
                    </div>
                  </div>
                )}
                
                {/* Drawer Links */}
                <div className="d-flex flex-column gap-3">
                  {links.map((link, idx) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                          color: isActive(link.path) ? 'var(--accent)' : 'var(--text-secondary)',
                          display: 'block',
                          padding: '8px 0'
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Bottom Actions inside drawer */}
              <div className="mt-auto">
                {token ? (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }} 
                    className="btn-househunt-outline w-100"
                  >
                    <Logout style={{ fontSize: '14px' }} />
                    Logout
                  </button>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <Link 
                      className="btn-househunt-outline w-100" 
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      className="btn-househunt-primary w-100" 
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
