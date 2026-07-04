import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, ArrowBack } from '@mui/icons-material';

const AddProperty = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // Check if edit param is present in url
  
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    Location: '',
    RentAmount: '',
    PropertyType: 'Apartment',
    FurnishingStatus: 'Unfurnished'
  });
  
  const [amenities, setAmenities] = useState({
    'pet-friendly': false,
    'pool': false,
    'garage': false
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.isApproved) {
      showToast('Your account is pending admin approval.', 'error');
      navigate('/owner');
      return;
    }

    if (editId) {
      fetchPropertyForEdit();
    }
  }, [editId]);

  const fetchPropertyForEdit = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/properties/${editId}`);
      const prop = response.data;
      
      // Check if this property belongs to the logged-in owner
      if (prop.OwnerID?._id !== user._id) {
        showToast('Access denied. You do not own this listing.', 'error');
        navigate('/owner/properties');
        return;
      }

      setFormData({
        Title: prop.Title,
        Description: prop.Description,
        Location: prop.Location,
        RentAmount: prop.RentAmount,
        PropertyType: prop.PropertyType,
        FurnishingStatus: prop.FurnishingStatus
      });

      setAmenities({
        'pet-friendly': prop.Amenities.includes('pet-friendly'),
        'pool': prop.Amenities.includes('pool'),
        'garage': prop.Amenities.includes('garage')
      });

    } catch (error) {
      console.error(error);
      showToast('Error loading property details for editing', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (e) => {
    setAmenities({ ...amenities, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { Title, Description, Location, RentAmount, PropertyType, FurnishingStatus } = formData;

    if (!Title || !Description || !Location || !RentAmount || !PropertyType || !FurnishingStatus) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('Title', Title);
    data.append('Description', Description);
    data.append('Location', Location);
    data.append('RentAmount', RentAmount);
    data.append('PropertyType', PropertyType);
    data.append('FurnishingStatus', FurnishingStatus);

    // Append amenities
    const selectedAmenities = Object.keys(amenities).filter(key => amenities[key]);
    selectedAmenities.forEach(amenity => {
      data.append('Amenities', amenity);
    });

    // Append images
    for (let i = 0; i < images.length; i++) {
      data.append('Images', images[i]);
    }

    try {
      if (editId) {
        await api.put(`/owner/properties/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Property listing updated successfully!', 'success');
      } else {
        await api.post('/owner/properties', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Property listed successfully!', 'success');
      }
      navigate('/owner/properties');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to submit property listing';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            onClick={() => navigate('/owner/properties')}
            variant="text" 
            startIcon={<ArrowBack />} 
            sx={{ color: 'var(--text-main)', textTransform: 'none' }}
          >
            Back to Listings
          </Button>
        </Box>

        <Container maxWidth="md">
          <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <Box sx={{ bgcolor: 'var(--primary-color)', color: 'white', py: 3, px: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: '800', fontFamily: 'Manrope' }}>
                {editId ? 'Edit Property Listing' : 'Add New Rental Property'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                Provide details about your property to find renters.
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Property Title *"
                      name="Title"
                      value={formData.Title}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="e.g. Modern 2 BHK Apartment in Downtown"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Detailed Description *"
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Write about the rooms, local context, utilities, distance to transport, etc."
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location / Area *"
                      name="Location"
                      value={formData.Location}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Monthly Rent Amount ($) *"
                      name="RentAmount"
                      value={formData.RentAmount}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="e.g. 1200"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Property Type *"
                      name="PropertyType"
                      value={formData.PropertyType}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="Apartment">Apartment</MenuItem>
                      <MenuItem value="House">House</MenuItem>
                      <MenuItem value="Studio">Studio</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Furnishing Status *"
                      name="FurnishingStatus"
                      value={formData.FurnishingStatus}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="Furnished">Furnished</MenuItem>
                      <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
                      <MenuItem value="Unfurnished">Unfurnished</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset" variant="standard">
                      <FormLabel component="legend" sx={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem', mb: 1 }}>
                        Amenities Included
                      </FormLabel>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={amenities['pet-friendly']} 
                              onChange={handleAmenityChange} 
                              name="pet-friendly" 
                            />
                          }
                          label="Pet-friendly"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={amenities['pool']} 
                              onChange={handleAmenityChange} 
                              name="pool" 
                            />
                          }
                          label="Swimming Pool"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={amenities['garage']} 
                              onChange={handleAmenityChange} 
                              name="garage" 
                            />
                          }
                          label="Garage"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1, fontWeight: '500' }}>
                      Property Images {editId ? '(Select new files to add images)' : '*'}
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      disabled={loading}
                      startIcon={<PhotoCamera />}
                      sx={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        py: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'var(--accent-color)'
                        }
                      }}
                    >
                      {images.length > 0 
                        ? `${images.length} file(s) selected` 
                        : 'Upload Property Images'
                      }
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        bgcolor: 'var(--primary-color)',
                        color: 'white',
                        py: 1.5,
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '600',
                        fontFamily: 'Manrope',
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'var(--primary-light)',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : editId ? 'Save Changes' : 'List Property'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Container>
    </>
  );
};

export default AddProperty;
