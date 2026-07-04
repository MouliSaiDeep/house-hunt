import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  CircularProgress,
  IconButton
} from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Add } from '@mui/icons-material';

const AllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/owner/properties');
      setProperties(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (property) => {
    const nextStatus = property.Status === 'Available' ? 'Booked' : 'Available';
    try {
      await api.put(`/owner/properties/${property._id}`, { Status: nextStatus });
      showToast(`Status updated to ${nextStatus}`, 'success');
      // Update local state
      setProperties(properties.map(p => p._id === property._id ? { ...p, Status: nextStatus } : p));
    } catch (error) {
      console.error(error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing permanently?')) return;

    try {
      await api.delete(`/owner/properties/${id}`);
      showToast('Property deleted successfully', 'success');
      setProperties(properties.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
      showToast('Failed to delete property listing', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
              My Properties
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
              Add, edit, or toggle listings and availability status.
            </Typography>
          </div>
          <Button
            component={Link}
            to="/owner/add-property"
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: 'var(--accent-color)',
              color: 'white',
              textTransform: 'none',
              fontFamily: 'Manrope',
              fontWeight: '600',
              '&:hover': { bgcolor: 'var(--accent-hover)' }
            }}
          >
            Add Property
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : properties.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic', mb: 2 }}>
              You have not listed any properties yet.
            </Typography>
            <Button
              component={Link}
              to="/owner/add-property"
              variant="outlined"
              sx={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
            >
              List Your First Property
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Property Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Rent</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Availability Action</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {property.Images && property.Images.length > 0 ? (
                          <img 
                            src={`http://localhost:5000${property.Images[0]}`} 
                            alt={property.Title} 
                            style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <Box sx={{ width: '60px', height: '40px', bgcolor: '#E2E8F0', borderRadius: '4px' }} />
                        )}
                        <div>
                          <Typography variant="body2" sx={{ fontWeight: '600' }}>
                            {property.Title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.Location}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>{property.PropertyType}</TableCell>
                    <TableCell>${property.RentAmount}/mo</TableCell>
                    <TableCell>
                      <Chip 
                        label={property.Status} 
                        size="small" 
                        color={property.Status === 'Available' ? 'success' : 'error'}
                        sx={{ fontWeight: '600' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={property.Status === 'Available' ? <ToggleOn /> : <ToggleOff />}
                        onClick={() => handleToggleStatus(property)}
                        color={property.Status === 'Available' ? 'primary' : 'secondary'}
                        sx={{ textTransform: 'none', fontWeight: '600' }}
                      >
                        {property.Status === 'Available' ? 'Set Booked' : 'Set Available'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        component={Link}
                        to={`/owner/add-property?edit=${property._id}`}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteProperty(property._id)}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
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

export default AllProperties;
