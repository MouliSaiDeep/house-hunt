import React, { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
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
      // Reload bookings
      fetchBookings();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || `Failed to update booking status`;
      showToast(errMsg, 'error');
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
            Rental Inquiries & Bookings
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            Review inquiries submitted by renters and confirm or cancel reservation requests.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No rental bookings or inquiries found for your properties.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Property Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Tenant Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Inquiry Date</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Requested Stay Period</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {booking.PropertyID?.Title || 'Deleted Property'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.PropertyID?.Location} • ${booking.PropertyID?.RentAmount}/mo
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {booking.TenantID?.Name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Email: {booking.TenantID?.Email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Phone: {booking.TenantID?.Phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {moment(booking.BookingDate).format('DD MMM YYYY, h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {moment(booking.StartDate).format('DD MMM YYYY')} to
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {moment(booking.EndDate).format('DD MMM YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.Status} 
                        size="small" 
                        color={getStatusChipColor(booking.Status)}
                        sx={{ fontWeight: '600' }}
                      />
                    </TableCell>
                    <TableCell>
                      {booking.Status === 'Pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                            sx={{ textTransform: 'none', fontWeight: '600' }}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                            sx={{ textTransform: 'none', fontWeight: '600' }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Reviewed</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default AllBookings;
