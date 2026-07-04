import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
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
  Chip,
  CircularProgress
} from '@mui/material';
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
      const response = await api.get('/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading bookings log', 'error');
    } finally {
      setLoading(false);
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
            System Bookings Log
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            System-wide view of all rental requests and booking inquiries.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No bookings or inquiries exist on the platform.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Property Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Tenant Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Inquiry Submitted</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Requested Term</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
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
                        {booking.TenantID?.Email} • {booking.TenantID?.Phone}
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
