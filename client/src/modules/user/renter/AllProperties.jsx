import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import AllPropertiesCards from '../AllPropertiesCards';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip
} from '@mui/material';
import { Close, Bookmark, Email, Phone, Person, Send, Info, CalendarMonth } from '@mui/icons-material';
import moment from 'moment';

const AllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // Filters State
  const [locationFilter, setLocationFilter] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState('');
  const [amenities, setAmenities] = useState({
    'pet-friendly': false,
    'pool': false,
    'garage': false
  });

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  
  // Inquiry Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Saved Search Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState('');

  // Parse URL search params on mount
  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const minR = searchParams.get('minRent') || '';
    const maxR = searchParams.get('maxRent') || '';
    const type = searchParams.get('propertyType') || '';
    const furnish = searchParams.get('furnishingStatus') || '';
    const am = searchParams.get('amenities') || '';

    setLocationFilter(loc);
    setMinRent(minR);
    setMaxRent(maxR);
    setPropertyType(type);
    setFurnishingStatus(furnish);

    if (am) {
      const amArray = am.split(',');
      setAmenities({
        'pet-friendly': amArray.includes('pet-friendly'),
        'pool': amArray.includes('pool'),
        'garage': amArray.includes('garage')
      });
    }

    fetchProperties(loc, minR, maxR, type, furnish, am);
    
    // Auto-open property detail modal if info parameter exists in URL
    const autoOpenId = searchParams.get('info');
    if (autoOpenId) {
      handleGetInfoById(autoOpenId);
    }
  }, [searchParams]);

  const fetchProperties = async (loc, minR, maxR, type, furnish, amString) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (loc) params.append('location', loc);
      if (minR) params.append('minRent', minR);
      if (maxR) params.append('maxRent', maxR);
      if (type) params.append('propertyType', type);
      if (furnish) params.append('furnishingStatus', furnish);
      
      let amList = [];
      if (amString) {
        amList = amString;
      } else {
        const list = Object.keys(amenities).filter(key => amenities[key]);
        if (list.length > 0) amList = list.join(',');
      }
      if (amList.length > 0) params.append('amenities', amList);

      const response = await api.get(`/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch property listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = {};
    if (locationFilter) params.location = locationFilter;
    if (minRent) params.minRent = minRent;
    if (maxRent) params.maxRent = maxRent;
    if (propertyType) params.propertyType = propertyType;
    if (furnishingStatus) params.furnishingStatus = furnishingStatus;

    const selectedAmenities = Object.keys(amenities).filter(key => amenities[key]);
    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(',');
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setLocationFilter('');
    setMinRent('');
    setMaxRent('');
    setPropertyType('');
    setFurnishingStatus('');
    setAmenities({
      'pet-friendly': false,
      'pool': false,
      'garage': false
    });
    setSearchParams({});
  };

  const handleAmenityChange = (e) => {
    setAmenities({ ...amenities, [e.target.name]: e.target.checked });
  };

  const handleGetInfoById = async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      setSelectedProperty(response.data);
      setDetailOpen(true);
    } catch (error) {
      console.error(error);
      showToast('Could not load property details', 'error');
    }
  };

  const handleGetInfo = async (property) => {
    // Hits the ID route to log view in BookingHistory
    handleGetInfoById(property._id);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedProperty(null);
    setStartDate('');
    setEndDate('');
    setChatMessage('');
    
    // Remove info parameter from search URL if present
    if (searchParams.get('info')) {
      const currentParams = Object.fromEntries(searchParams.entries());
      delete currentParams.info;
      setSearchParams(currentParams);
    }
  };

  // Inquiry Submission (Creates Booking)
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Please select inquiry start and end dates', 'error');
      return;
    }
    if (moment(startDate).isAfter(moment(endDate))) {
      showToast('Start date must be before End date', 'error');
      return;
    }

    setInquiryLoading(true);
    try {
      const payload = {
        PropertyID: selectedProperty._id,
        StartDate: startDate,
        EndDate: endDate
      };
      await api.post('/bookings', payload);
      showToast('Inquiry submitted! Booking status is now Pending.', 'success');
      handleCloseDetail();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error submitting booking request';
      showToast(msg, 'error');
    } finally {
      setInquiryLoading(false);
    }
  };

  // Direct Message Submission (Simulated Offline Chat Entry point)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) {
      showToast('Please type a message first', 'warning');
      return;
    }

    setSendingMsg(true);
    setTimeout(() => {
      showToast('Message sent! The owner will get in touch offline.', 'success');
      setChatMessage('');
      setSendingMsg(false);
    }, 1000);
  };

  // Save Current Filter Search
  const handleSaveSearch = async () => {
    if (!savedSearchName.trim()) {
      showToast('Please specify a name for this search', 'warning');
      return;
    }

    try {
      const queryPayload = {};
      if (locationFilter) queryPayload.location = locationFilter;
      if (minRent) queryPayload.minRent = Number(minRent);
      if (maxRent) queryPayload.maxRent = Number(maxRent);
      if (propertyType) queryPayload.propertyType = propertyType;
      if (furnishingStatus) queryPayload.furnishingStatus = furnishingStatus;
      
      const selectedAmenities = Object.keys(amenities).filter(key => amenities[key]);
      if (selectedAmenities.length > 0) {
        queryPayload.amenities = selectedAmenities;
      }

      await api.post('/users/saved-searches', {
        name: savedSearchName,
        query: queryPayload
      });

      showToast('Search filters saved successfully!', 'success');
      setSaveModalOpen(false);
      setSavedSearchName('');
    } catch (error) {
      console.error(error);
      showToast('Failed to save search', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant="h4" component="h1" sx={{ fontWeight: '800' }}>
              Search Rentals
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
              Find available properties using the filters below.
            </Typography>
          </div>
          <Button
            onClick={() => setSaveModalOpen(true)}
            variant="outlined"
            startIcon={<Bookmark />}
            sx={{
              mt: { xs: 2, sm: 0 },
              borderColor: 'var(--primary-color)',
              color: 'var(--primary-color)',
              textTransform: 'none',
              fontFamily: 'Manrope',
              fontWeight: '600',
              '&:hover': {
                borderColor: 'var(--primary-light)',
                bgcolor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Save This Search
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <Card sx={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', p: 3, position: 'sticky', top: '24px' }}>
              <Typography variant="h6" sx={{ fontWeight: '700', mb: 3 }}>
                Filters
              </Typography>
              
              <form onSubmit={handleApplyFilters}>
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    size="small"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="City or location..."
                  />
                </Box>
                
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: '600', color: 'var(--text-main)', mb: 1 }}>
                    Monthly Rent ($)
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Min"
                        size="small"
                        type="number"
                        value={minRent}
                        onChange={(e) => setMinRent(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max"
                        size="small"
                        type="number"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Property Type"
                    size="small"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <MenuItem value="">Any Type</MenuItem>
                    <MenuItem value="Apartment">Apartment</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Studio">Studio</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Furnishing Status"
                    size="small"
                    value={furnishingStatus}
                    onChange={(e) => setFurnishingStatus(e.target.value)}
                  >
                    <MenuItem value="">Any Status</MenuItem>
                    <MenuItem value="Furnished">Furnished</MenuItem>
                    <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
                    <MenuItem value="Unfurnished">Unfurnished</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend" sx={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                      Amenities
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={amenities['pet-friendly']} 
                            onChange={handleAmenityChange} 
                            name="pet-friendly" 
                            size="small"
                          />
                        }
                        label={<span style={{ fontSize: '0.85rem' }}>Pet-friendly</span>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={amenities['pool']} 
                            onChange={handleAmenityChange} 
                            name="pool" 
                            size="small"
                          />
                        }
                        label={<span style={{ fontSize: '0.85rem' }}>Swimming Pool</span>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={amenities['garage']} 
                            onChange={handleAmenityChange} 
                            name="garage" 
                            size="small"
                          />
                        }
                        label={<span style={{ fontSize: '0.85rem' }}>Garage</span>}
                      />
                    </FormGroup>
                  </FormControl>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: 'var(--primary-color)',
                    color: 'white',
                    mb: 1,
                    textTransform: 'none',
                    fontWeight: '600',
                    fontFamily: 'Manrope',
                    '&:hover': {
                      bgcolor: 'var(--primary-light)'
                    }
                  }}
                >
                  Apply Filters
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                    textTransform: 'none',
                    fontWeight: '500',
                    '&:hover': {
                      borderColor: '#94A3B8'
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </form>
            </Card>
          </Grid>

          {/* Listings Grid */}
          <Grid item xs={12} md={8} lg={9}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : properties.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No available properties match your filters.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} lg={4} key={property._id}>
                    <AllPropertiesCards 
                      property={property} 
                      onGetInfo={handleGetInfo}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Property Details Inquiry Dialog */}
      <Dialog 
        open={detailOpen} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: { borderRadius: 'var(--radius-lg)' }
        }}
      >
        {selectedProperty && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <Typography variant="h5" component="h2" sx={{ fontWeight: '800', fontFamily: 'Manrope' }}>
                  {selectedProperty.Title}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  {selectedProperty.Location}
                </Typography>
              </div>
              <IconButton onClick={handleCloseDetail}>
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {/* Images & Details */}
                <Grid item xs={12} md={7}>
                  {/* Image Grid/Scroll */}
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2, mb: 3 }}>
                    {selectedProperty.Images && selectedProperty.Images.length > 0 ? (
                      selectedProperty.Images.map((img, i) => (
                        <img 
                          key={i}
                          src={`http://localhost:5000${img}`} 
                          alt={`property-${i}`}
                          style={{ height: '220px', width: '320px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                        />
                      ))
                    ) : (
                      <img 
                        src='https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80' 
                        alt="fallback"
                        style={{ height: '220px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: '700', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedProperty.Description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: '700', mb: 1.5 }}>
                      Key Specifications
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label={`Type: ${selectedProperty.PropertyType}`} variant="outlined" />
                      <Chip label={`Furnishing: ${selectedProperty.FurnishingStatus}`} variant="outlined" />
                      <Chip label={`Rent: $${selectedProperty.RentAmount}/mo`} variant="outlined" sx={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', fontWeight: '600' }} />
                    </Box>
                  </Box>

                  {selectedProperty.Amenities && selectedProperty.Amenities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: '700', mb: 1.5 }}>
                        Amenities Included
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedProperty.Amenities.map((amenity, i) => (
                          <Chip key={i} label={amenity} size="small" sx={{ bgcolor: '#F1F5F9' }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Owner Contact details panel */}
                  <Card sx={{ bgcolor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: '700', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: 'var(--accent-color)' }} /> Owner Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Name</Typography>
                          <Typography variant="body2" sx={{ fontWeight: '600' }}>{selectedProperty.OwnerID?.Name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body2" sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email fontSize="inherit" /> {selectedProperty.OwnerID?.Email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Phone</Typography>
                          <Typography variant="body2" sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone fontSize="inherit" /> {selectedProperty.OwnerID?.Phone}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Forms Column (Inquiry & Direct Message) */}
                <Grid item xs={12} md={5}>
                  {/* Booking Inquiry Card */}
                  <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', mb: 3, boxShadow: 'var(--shadow-sm)' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid var(--border-color)', bgcolor: 'var(--primary-color)', color: 'white' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth /> Request Info / Book Property
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <form onSubmit={handleInquirySubmit}>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={inquiryLoading}
                          />
                        </Box>
                        <Box sx={{ mb: 3 }}>
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={inquiryLoading}
                          />
                        </Box>
                        <Button
                          fullWidth
                          type="submit"
                          variant="contained"
                          disabled={inquiryLoading}
                          sx={{
                            bgcolor: 'var(--primary-color)',
                            color: 'white',
                            fontWeight: '600',
                            py: 1.25,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'var(--primary-light)' }
                          }}
                        >
                          {inquiryLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit Inquiry'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Direct Contact Message Form (Direct Contact Entry point) */}
                  <Card sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid var(--border-color)', bgcolor: '#F8FAFC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-main)' }}>
                        <Email sx={{ color: 'var(--accent-color)' }} /> Direct Message Owner
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        Have questions about the rental? Send a direct message to the landlord.
                      </Typography>
                      <form onSubmit={handleSendMessage}>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Type your message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            disabled={sendingMsg}
                          />
                        </Box>
                        <Button
                          fullWidth
                          type="submit"
                          variant="outlined"
                          disabled={sendingMsg}
                          startIcon={<Send />}
                          sx={{
                            borderColor: 'var(--accent-color)',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: 'var(--accent-hover)',
                              bgcolor: 'rgba(217, 119, 6, 0.04)'
                            }
                          }}
                        >
                          {sendingMsg ? <CircularProgress size={20} color="inherit" /> : 'Send Offline Message'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Save Search Modal */}
      <Dialog 
        open={saveModalOpen} 
        onClose={() => setSaveModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: 'var(--radius-md)' }
        }}
      >
        <DialogTitle sx={{ fontWeight: '700', fontFamily: 'Manrope' }}>Save This Search</DialogTitle>
        <DialogContent sx={{ minWidth: '320px', pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Assign a label to save your current filter preferences.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Search Label Name"
            placeholder="e.g. Hyderabad Apartments"
            value={savedSearchName}
            onChange={(e) => setSavedSearchName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setSaveModalOpen(false)} sx={{ textTransform: 'none', color: 'var(--text-muted)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSearch} 
            variant="contained"
            sx={{ bgcolor: 'var(--primary-color)', textTransform: 'none', fontWeight: '600' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AllProperties;
