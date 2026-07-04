import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
import { People, HomeWork, CalendarMonth, Shield } from '@mui/icons-material';

const AdminHome = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalProperties: 0, totalBookings: 0 });
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const propertiesRes = await api.get('/admin/properties');
      const bookingsRes = await api.get('/admin/bookings');

      setStats({
        totalUsers: usersRes.data.length,
        totalProperties: propertiesRes.data.length,
        totalBookings: bookingsRes.data.length
      });
    } catch (error) {
      console.error(error);
      showToast('Error loading platform statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="mb-5 d-flex align-items-center gap-3">
            <Shield style={{ fontSize: '36px', color: 'var(--accent)' }} />
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                Admin Moderation Center
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                Monitor system listings, moderate user accounts, and approve landlords.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : (
            <div className="row g-4">
              {/* Stats Cards */}
              <div className="col-12 col-md-4">
                <div className="p-4 d-flex justify-content-between align-items-center househunt-card" style={{ height: '100%' }}>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Registered Users
                    </span>
                    <span className="d-block" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {stats.totalUsers}
                    </span>
                  </div>
                  <People style={{ fontSize: '48px', color: 'var(--accent)' }} />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-4 d-flex justify-content-between align-items-center househunt-card" style={{ height: '100%' }}>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active Properties
                    </span>
                    <span className="d-block" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {stats.totalProperties}
                    </span>
                  </div>
                  <HomeWork style={{ fontSize: '48px', color: 'var(--accent)' }} />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-4 d-flex justify-content-between align-items-center househunt-card" style={{ height: '100%' }}>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Bookings
                    </span>
                    <span className="d-block" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {stats.totalBookings}
                    </span>
                  </div>
                  <CalendarMonth style={{ fontSize: '48px', color: 'var(--accent)' }} />
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="col-12 mt-4">
                <div 
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>
                    Moderation Quick Links
                  </h2>
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      to="/admin/users"
                      className="btn-househunt-primary py-2.5 px-4"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Manage Users & Landlords
                    </Link>
                    <Link
                      to="/admin/properties"
                      className="btn-househunt-outline py-2.5 px-4"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Moderate Properties
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className="btn-househunt-outline py-2.5 px-4"
                      style={{ fontSize: '0.85rem' }}
                    >
                      View System Bookings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminHome;
