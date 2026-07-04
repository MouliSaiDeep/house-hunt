import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import { HomeWork, CalendarMonth, Add, Warning } from '@mui/icons-material';

const OwnerHome = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalListings: 0, pendingInquiries: 0 });
  
  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  })();
  const { showToast } = useToast();

  useEffect(() => {
    if (user.isApproved) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const propertiesRes = await api.get('/owner/properties');
      const bookingsRes = await api.get('/owner/bookings');
      
      const pendingCount = bookingsRes.data.filter(b => b.Status === 'Pending').length;
      
      setStats({
        totalListings: propertiesRes.data.length,
        pendingInquiries: pendingCount
      });
    } catch (error) {
      console.error(error);
      showToast('Error loading landlord statistics', 'error');
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
          <div className="mb-5">
            <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
              Landlord Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
              Manage your rental listings and confirm tenant inquiries.
            </p>
          </div>

          {/* Admin Approval Pending Check */}
          {!user.isApproved && (
            <div 
              className="p-4 mb-4 rounded d-flex gap-3 align-items-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)'
              }}
            >
              <Warning style={{ fontSize: '32px' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                  Approval Pending
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Your landlord profile is awaiting review by a system administrator. You will gain listing permissions, edit controls, and tenant inquiry management tools once your account is toggled to approved status.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : (
            <div className="row g-4">
              {/* Stats Cards */}
              <div className="col-12 col-sm-6">
                <div 
                  className="p-4 d-flex justify-content-between align-items-center househunt-card"
                  style={{ height: '100%' }}
                >
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      My Properties
                    </span>
                    <span className="d-block" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {stats.totalListings}
                    </span>
                  </div>
                  <HomeWork style={{ fontSize: '48px', color: 'var(--accent)' }} />
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div 
                  className="p-4 d-flex justify-content-between align-items-center househunt-card"
                  style={{ height: '100%' }}
                >
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pending Inquiries
                    </span>
                    <span className="d-block" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {stats.pendingInquiries}
                    </span>
                  </div>
                  <CalendarMonth style={{ fontSize: '48px', color: 'var(--accent)' }} />
                </div>
              </div>

              {/* Quick Actions Panel */}
              {user.isApproved && (
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
                      Quick Actions
                    </h2>
                    <div className="d-flex flex-wrap gap-2">
                      <Link
                        to="/owner/add-property"
                        className="btn-househunt-primary py-2.5 px-4"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <Add style={{ fontSize: '16px' }} />
                        Add New Listing
                      </Link>
                      <Link
                        to="/owner/properties"
                        className="btn-househunt-outline py-2.5 px-4"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Manage Properties
                      </Link>
                      <Link
                        to="/owner/bookings"
                        className="btn-househunt-outline py-2.5 px-4"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Review Inquiries
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OwnerHome;
