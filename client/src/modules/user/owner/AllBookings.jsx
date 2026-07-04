import React, { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import { CheckCircle, Cancel } from '@mui/icons-material';
import moment from 'moment';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/owner/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading booking inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'Confirmed' ? 'confirm' : 'cancel';
    if (!window.confirm(`Are you sure you want to ${actionText} this booking inquiry?`)) return;

    try {
      await api.put(`/owner/bookings/${id}`, { Status: status });
      showToast(`Booking inquiry successfully ${status.toLowerCase()}!`, 'success');
      fetchBookings();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || `Failed to update booking status`;
      showToast(errMsg, 'error');
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
              Rental Inquiries & Bookings
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
              Review inquiries submitted by renters and confirm or cancel reservation requests.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5 rounded" style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-muted m-0 italic" style={{ fontSize: '0.85rem' }}>No rental bookings or inquiries found for your properties.</p>
            </div>
          ) : (
            <div 
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div className="table-responsive">
                <table className="table m-0">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th className="p-3 border-0">Property Details</th>
                      <th className="p-3 border-0">Tenant Details</th>
                      <th className="p-3 border-0">Inquiry Date</th>
                      <th className="p-3 border-0">Requested Stay Period</th>
                      <th className="p-3 border-0">Status</th>
                      <th className="p-3 border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ verticalAlign: 'middle' }}>
                        <td className="p-3">
                          <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {booking.PropertyID?.Title || 'Deleted Property'}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {booking.PropertyID?.Location} • ${booking.PropertyID?.RentAmount}/mo
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {booking.TenantID?.Name}
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            Email: {booking.TenantID?.Email}
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            Phone: {booking.TenantID?.Phone}
                          </span>
                        </td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>
                          {moment(booking.BookingDate).format('DD MMM YYYY, h:mm a')}
                        </td>
                        <td className="p-3">
                          <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {moment(booking.StartDate).format('DD MMM YYYY')} to
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            {moment(booking.EndDate).format('DD MMM YYYY')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`status-badge ${booking.Status.toLowerCase()}`}>
                            {booking.Status}
                          </span>
                        </td>
                        <td className="p-3 text-end">
                          {booking.Status === 'Pending' ? (
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '0.7rem', padding: '6px 12px', fontWeight: 600 }}
                              >
                                <CheckCircle style={{ fontSize: '14px' }} />
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '0.7rem', padding: '6px 12px', fontWeight: 600 }}
                              >
                                <Cancel style={{ fontSize: '14px' }} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllBookings;
