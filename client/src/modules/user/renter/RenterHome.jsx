import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import { motion } from 'framer-motion';
import { 
  Delete, 
  History, 
  Search, 
  Analytics, 
  School, 
  DirectionsBus, 
  Security, 
  Apartment 
} from '@mui/icons-material';
import moment from 'moment';

const RenterHome = () => {
  const [bookings, setBookings] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marketTrends, setMarketTrends] = useState([]);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data);

      const searchesRes = await api.get('/users/saved-searches');
      setSavedSearches(searchesRes.data);

      const historyRes = await api.get('/bookings/history');
      setViewHistory(historyRes.data);

      const propertiesRes = await api.get('/properties');
      deriveMarketTrends(propertiesRes.data);
    } catch (error) {
      console.error('Error fetching renter dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deriveMarketTrends = (properties) => {
    const locations = {};
    properties.forEach(p => {
      if (!locations[p.Location]) {
        locations[p.Location] = { total: 0, count: 0 };
      }
      locations[p.Location].total += p.RentAmount;
      locations[p.Location].count += 1;
    });

    const trends = Object.keys(locations).map(loc => ({
      location: loc,
      avgRent: Math.round(locations[loc].total / locations[loc].count),
      count: locations[loc].count
    }));

    setMarketTrends(trends);
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking inquiry?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      showToast('Booking cancelled successfully', 'success');
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to cancel booking', 'error');
    }
  };

  const handleDeleteSavedSearch = async (searchId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/users/saved-searches/${searchId}`);
      showToast('Saved search deleted', 'success');
      setSavedSearches(savedSearches.filter(s => s._id !== searchId));
    } catch (error) {
      console.error(error);
      showToast('Failed to delete saved search', 'error');
    }
  };

  const handleApplySavedSearch = (query) => {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key]) {
        params.append(key, query[key]);
      }
    });
    navigate(`/renter/properties?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="mb-5">
            <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
              Tenant Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
              Track your rental inquiries, saved searches, and local rent trends.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : (
            <div className="row g-4">
              {/* Left Column: Bookings & Trends */}
              <div className="col-12 col-lg-8">
                {/* Bookings Card */}
                <div 
                  className="mb-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>My Inquiries & Bookings</h2>
                    <Link to="/renter/properties" className="btn-househunt-primary py-2 px-3" style={{ fontSize: '0.75rem' }}>
                      Browse Properties
                    </Link>
                  </div>
                  
                  <div className="p-0">
                    {bookings.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted m-0 italic" style={{ fontSize: '0.85rem' }}>You have not submitted any inquiries yet.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table m-0">
                          <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              <th className="p-3 border-0">Property</th>
                              <th className="p-3 border-0">Rent</th>
                              <th className="p-3 border-0">Dates</th>
                              <th className="p-3 border-0">Status</th>
                              <th className="p-3 border-0 text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map((booking) => (
                              <tr key={booking._id} style={{ verticalAlign: 'middle' }}>
                                <td className="p-3">
                                  <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {booking.PropertyID?.Title || 'N/A'}
                                  </span>
                                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {booking.PropertyID?.Location}
                                  </span>
                                </td>
                                <td className="p-3" style={{ fontSize: '0.85rem' }}>
                                  ${booking.PropertyID?.RentAmount}/mo
                                </td>
                                <td className="p-3" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {moment(booking.StartDate).format('DD MMM YYYY')} to {moment(booking.EndDate).format('DD MMM YYYY')}
                                </td>
                                <td className="p-3">
                                  <span className={`status-badge ${booking.Status.toLowerCase()}`}>
                                    {booking.Status}
                                  </span>
                                </td>
                                <td className="p-3 text-end">
                                  {booking.Status === 'Pending' ? (
                                    <button 
                                      onClick={() => handleCancelBooking(booking._id)}
                                      className="btn btn-sm btn-outline-danger"
                                      style={{ fontSize: '0.7rem', padding: '4px 10px', textTransform: 'none' }}
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Trends Card */}
                <div 
                  className="mb-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Analytics style={{ color: 'var(--accent)', fontSize: '20px' }} />
                    Market Insights & Rent Trends
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Average rental rates calculated directly from listings available in each area:
                  </p>
                  
                  {marketTrends.length === 0 ? (
                    <p className="text-muted m-0 italic" style={{ fontSize: '0.85rem' }}>No trend data available.</p>
                  ) : (
                    <div className="row g-3">
                      {marketTrends.map((trend, idx) => (
                        <div className="col-12 col-sm-6" key={idx}>
                          <div 
                            style={{
                              padding: '20px',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }}
                          >
                            <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {trend.location}
                            </span>
                            <span className="d-block" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                              ${trend.avgRent} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo avg</span>
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                              Based on {trend.count} listing(s)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <hr style={{ borderColor: 'var(--border)', margin: '32px 0' }} />

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
                    Neighborhood Safety & Services
                  </h3>
                  
                  <div className="row g-3">
                    <div className="col-4">
                      <div className="p-3 text-center rounded" style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)' }}>
                        <School style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '6px' }} />
                        <span className="d-block" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Schools</span>
                        <span className="badge mt-2" style={{ fontSize: '0.55rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Soon</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 text-center rounded" style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)' }}>
                        <DirectionsBus style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '6px' }} />
                        <span className="d-block" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Transit</span>
                        <span className="badge mt-2" style={{ fontSize: '0.55rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Soon</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 text-center rounded" style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)' }}>
                        <Security style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '6px' }} />
                        <span className="d-block" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Safety</span>
                        <span className="badge mt-2" style={{ fontSize: '0.55rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Saved Searches & History */}
              <div className="col-12 col-lg-4">
                {/* Saved Searches */}
                <div 
                  className="mb-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="p-4 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Search style={{ color: 'var(--accent)', fontSize: '20px' }} />
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Saved Searches</h2>
                  </div>
                  
                  <div>
                    {savedSearches.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted m-0 italic" style={{ fontSize: '0.8rem' }}>No saved searches yet.</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush" style={{ backgroundColor: 'transparent' }}>
                        {savedSearches.map((search) => (
                          <div 
                            key={search._id}
                            onClick={() => handleApplySavedSearch(search.query)}
                            className="list-group-item d-flex justify-content-between align-items-center p-3"
                            style={{
                              backgroundColor: 'transparent',
                              borderBottom: '1px solid var(--border)',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="flex-grow-1 min-w-0 pr-3">
                              <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {search.name}
                              </span>
                              <span className="text-muted text-truncate d-block" style={{ fontSize: '0.7rem' }}>
                                {Object.keys(search.query || {}).map(k => `${k}: ${search.query[k]}`).join(', ') || 'All Locations'}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => handleDeleteSavedSearch(search._id, e)}
                              className="btn btn-link text-danger p-1"
                              style={{ display: 'inline-flex' }}
                            >
                              <Delete style={{ fontSize: '18px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Viewing History */}
                <div 
                  className="mb-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="p-4 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <History style={{ color: 'var(--accent)', fontSize: '20px' }} />
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Recently Viewed</h2>
                  </div>
                  
                  <div>
                    {viewHistory.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted m-0 italic" style={{ fontSize: '0.8rem' }}>No viewing history found.</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush" style={{ backgroundColor: 'transparent' }}>
                        {viewHistory.slice(0, 5).map((item, idx) => {
                          const prop = item.PropertyID;
                          if (!prop) return null;
                          return (
                            <Link 
                              key={idx}
                              to={`/renter/properties?info=${prop._id}`}
                              className="list-group-item p-3 text-decoration-none"
                              style={{
                                backgroundColor: 'transparent',
                                borderBottom: '1px solid var(--border)',
                                display: 'block',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {prop.Title}
                              </span>
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                                {prop.Location} • ${prop.RentAmount}/mo
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
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

export default RenterHome;
