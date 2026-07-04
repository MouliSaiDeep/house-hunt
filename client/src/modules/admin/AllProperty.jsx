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
  Button,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const AllProperty = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/properties');
      setProperties(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading properties list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this property listing permanently? This action is irreversible.')) return;

    try {
      await api.delete(`/admin/properties/${id}`);
      showToast('Listing removed successfully by Admin', 'success');
      setProperties(properties.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
      showToast('Failed to remove listing', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
            System Property Listings
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            Moderate listings and delete listings violating platform terms.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : properties.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No properties listed on the platform.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Property Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Landlord Details</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Monthly Rent</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Action</TableCell>
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
                            Location: {property.Location}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {property.OwnerID?.Name || 'Deleted User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {property.OwnerID?.Email}
                      </Typography>
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
                      <IconButton 
                        onClick={() => handleDeleteListing(property._id)}
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

export default AllProperty;
