import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3" style={{ backgroundColor: 'var(--primary-color) !important' }}>
      <div className="container">
        <Link className="navbar-brand fw-extrabold fs-4 d-flex align-items-center" to="/" style={{ fontFamily: 'Manrope', letterSpacing: '-0.03em' }}>
          <span style={{ color: 'var(--accent-color)', marginRight: '4px' }}>House</span>Hunt
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* General Link */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            
            {/* Tenant Links */}
            {token && user.UserType === 'Tenant' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/renter')}`} to="/renter">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/renter/properties')}`} to="/renter/properties">Browse Properties</Link>
                </li>
              </>
            )}

            {/* Owner Links */}
            {token && user.UserType === 'Owner' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/owner')}`} to="/owner">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/owner/properties')}`} to="/owner/properties">My Properties</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/owner/bookings')}`} to="/owner/bookings">Bookings</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/owner/add-property')}`} to="/owner/add-property">Add Property</Link>
                </li>
              </>
            )}

            {/* Admin Links */}
            {token && user.UserType === 'Admin' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin')}`} to="/admin">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/users')}`} to="/admin/users">Users</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/properties')}`} to="/admin/properties">Properties</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/bookings')}`} to="/admin/bookings">Bookings</Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {token ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-white d-none d-md-block text-end">
                  <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Logged in as</small>
                  <span className="fw-semibold text-light">{user.Name} ({user.UserType})</span>
                </div>
                
                {user.ProfileImage ? (
                  <img 
                    src={user.ProfileImage.startsWith('http') ? user.ProfileImage : `http://localhost:5000${user.ProfileImage}`} 
                    alt="profile" 
                    className="rounded-circle border border-2 border-secondary"
                    width="40" 
                    height="40"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="bg-secondary rounded-circle text-white d-flex align-items-center justify-content-center fw-bold border border-2 border-secondary"
                    style={{ width: '40px', height: '40px' }}
                  >
                    {user.Name ? user.Name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-light px-3" to="/login">Login</Link>
                <Link className="btn px-3" to="/register" style={{ backgroundColor: 'var(--accent-color)', color: '#FFFFFF' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
