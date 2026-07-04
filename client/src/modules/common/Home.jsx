import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import api from '../../utils/api';
import PageTransition from './PageTransition';
import { 
  ArrowUpward, 
  Search, 
  LocationOn, 
  AttachMoney, 
  HomeWork,
  ArrowForward,
  Favorite,
  FavoriteBorder,
  LocalPostOffice,
  Apartment
} from '@mui/icons-material';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [favorites, setFavorites] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const navigate = useNavigate();
  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  })();

  useEffect(() => {
    fetchProperties();
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/properties');
      setProperties(response.data.slice(0, 6)); // Show first 6 properties
    } catch (error) {
      console.error('Error fetching properties:', error);
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
      const params = new URLSearchParams();
      if (searchQuery) params.append('location', searchQuery);
      if (propertyType) params.append('propertyType', propertyType);
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (min) params.append('minRent', min);
        if (max) params.append('maxRent', max);
      }
      navigate(`/renter/properties?${params.toString()}`);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  return (
    <PageTransition>
      <Navbar />
      
      {/* Hero Section */}
      <div 
        style={{ 
          position: 'relative',
          minHeight: '75vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000000',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Ken Burns Background Image */}
        <div 
          className="ken-burns-bg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.9)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '40px 16px' }}>
          <div className="row justify-content-center text-center">
            <div className="col-12 col-xl-10">
              <h1 
                style={{ 
                  fontSize: 'clamp(2rem, 5.5vw, 4rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1',
                  marginBottom: '20px'
                }}
              >
                Find Your Perfect <span style={{ color: 'var(--accent)' }}>Home</span>
              </h1>
              
              <p 
                style={{ 
                  fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
                  color: 'var(--text-secondary)',
                  marginBottom: '40px',
                  maxWidth: '700px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                Search thousands of premium listings, inspect amenities, and make direct offline deals with trusted landlords.
              </p>
              
              {/* Pill-Shaped Search Bar */}
              <div 
                className="mx-auto"
                style={{ maxWidth: '900px' }}
              >
                <form 
                  onSubmit={handleSearchSubmit}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '12px 20px',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {/* Location Input */}
                  <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: '200px' }}>
                    <LocationOn style={{ color: 'var(--accent)', marginRight: '8px' }} />
                    <input 
                      type="text" 
                      placeholder="Enter city (e.g. New York, Hyderabad)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        width: '100%',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1 justify-content-end">
                    {/* Property Type select dropdown */}
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Any Property Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                    </select>

                    {/* Price Range dropdown */}
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Any Budget</option>
                      <option value="0-1000">Under $1,000</option>
                      <option value="1000-2000">$1,000 - $2,000</option>
                      <option value="2000-4000">$2,000 - $4,000</option>
                      <option value="4000-999999">$4,000+</option>
                    </select>

                    <button 
                      type="submit" 
                      className="btn-househunt-primary"
                      style={{
                        borderRadius: '16px',
                        padding: '10px 24px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <Search style={{ fontSize: '18px' }} />
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Grid */}
      <div style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-12 col-md-8">
              <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2rem' }}>
                Featured listings
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Browse verified premium listings handpicked by our team.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="row">
              {[1, 2, 3].map((n) => (
                <div className="col-12 col-md-4 mb-4" key={n}>
                  <div className="househunt-card skeleton-shimmer" style={{ height: '400px' }} />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5 rounded" style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="m-0 text-muted italic">No properties listed yet. Check back soon!</p>
            </div>
          ) : (
            <div 
              className="row"
            >
              {properties.map((property) => (
                <div 
                  className="col-12 col-md-6 col-lg-4 mb-4" 
                  key={property._id}
                >
                  <div className="househunt-card h-100 d-flex flex-column">
                    {/* Card Media Header */}
                    <div className="image-zoom-container" style={{ height: '240px' }}>
                      <img 
                        src={property.Images && property.Images[0] ? `http://localhost:5000${property.Images[0]}` : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'}
                        alt={property.Title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      
                      {/* Favorite Heart Icon */}
                      <button
                        onClick={() => toggleFavorite(property._id)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'rgba(10, 10, 10, 0.6)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: favorites[property._id] ? '#ef4444' : '#ffffff',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)',
                          transition: 'color 0.2s'
                        }}
                      >
                        {favorites[property._id] ? (
                          <Favorite className="heart-bounce" style={{ fontSize: '20px' }} />
                        ) : (
                          <FavoriteBorder style={{ fontSize: '20px' }} />
                        )}
                      </button>
                      
                      {/* Featured Badge */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          backgroundColor: 'rgba(34, 197, 94, 0.95)',
                          color: '#000000',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase'
                        }}
                      >
                        featured
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span 
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {property.PropertyType}
                        </span>
                        
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                          ${property.RentAmount}/mo
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {property.Title}
                      </h3>

                      <div className="d-flex align-items-center text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                        <LocationOn style={{ fontSize: '14px', marginRight: '4px', color: 'var(--text-secondary)' }} />
                        {property.Location}
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '24px' }}>
                        {property.Description}
                      </p>

                      {/* Specs flex bar */}
                      <div 
                        className="d-flex gap-3 mb-4 mt-auto py-2 px-3 rounded" 
                        style={{ 
                          backgroundColor: 'var(--bg-tertiary)', 
                          border: '1px solid var(--border)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <div>🛏 {property.FurnishingStatus || 'Furnished'}</div>
                        <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                        <div>📍 {(property.Location || '').split(',')[0] || 'N/A'}</div>
                      </div>

                      <Link
                        to={localStorage.getItem('token') ? (user.UserType === 'Tenant' ? `/renter/properties?info=${property._id}` : `/renter/properties`) : `/login`}
                        className="btn-househunt-primary w-100"
                      >
                        View Details
                        <ArrowForward style={{ fontSize: '16px' }} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browse All CTA */}
          <div className="text-center mt-5">
            <Link 
              to={localStorage.getItem('token') ? "/renter/properties" : "/login"}
              className="btn-househunt-outline px-4 py-2"
              style={{ fontSize: '0.85rem' }}
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Landing Owner Promotion Callout */}
      <div style={{ padding: '60px 0', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-12 col-lg-7 mb-4 mb-lg-0">
              <h2 style={{ fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                Are you a property owner?
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '600px' }}>
                List your flats, villas, or studio apartments in front of thousands of active renters. Monitor approvals, check bookings, and interact with tenants smoothly through your owner dashboard.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-lg-end">
              <Link 
                to="/register" 
                className="btn-househunt-primary px-4 py-3"
              >
                Join as Landlord
                <HomeWork style={{ fontSize: '16px' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '80px 0 40px 0'
        }}
      >
        <div className="container">
          <div className="row mb-5">
            {/* Tagline */}
            <div className="col-12 col-lg-4 mb-4 mb-lg-0">
              <div className="d-flex align-items-center gap-2 mb-3" style={{ fontWeight: 700, fontFamily: 'var(--font-family)', fontSize: '1.15rem' }}>
                <Apartment style={{ color: 'var(--accent)' }} />
                <span>house-hunt</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.7' }}>
                A premium, curated house listing and rental platform connecting owners and renters directly.
              </p>
            </div>

            {/* Links */}
            <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Links
              </h4>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.8rem' }}>
                <li><Link to="/" className="hover-underline-link">Home</Link></li>
                <li><Link to="/login" className="hover-underline-link">Login</Link></li>
                <li><Link to="/register" className="hover-underline-link">Register</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resources
              </h4>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.8rem' }}>
                <li><a href="#" className="hover-underline-link">Support Docs</a></li>
                <li><a href="#" className="hover-underline-link">Privacy Policy</a></li>
                <li><a href="#" className="hover-underline-link">Terms of Service</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-12 col-md-6 col-lg-4">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Newsletter
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Subscribe to get alerts on newly listed rental options.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="d-flex gap-2">
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.8rem',
                    flexGrow: 1,
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn-househunt-primary"
                  style={{ padding: '10px 16px', borderRadius: '8px' }}
                >
                  <LocalPostOffice style={{ fontSize: '18px' }} />
                </button>
              </form>
              
              {newsletterSuccess && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '8px' }}>
                  Subscribed successfully! Thank you.
                </div>
              )}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', marginBottom: '24px' }} />

          {/* Bottom copyright block */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} house-hunt. All rights reserved.
            </span>
            
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="hover-underline-link"
              style={{ fontSize: '0.75rem' }}
            >
              Back to Top &uarr;
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--accent)',
            color: '#000000',
            border: 'none',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
            zIndex: 99,
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ArrowUpward style={{ fontSize: '18px' }} />
        </button>
      )}
    </PageTransition>
  );
};

export default Home;
