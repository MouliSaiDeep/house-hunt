import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import AllPropertiesCards from '../AllPropertiesCards';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close, 
  Bookmark, 
  Email, 
  Phone, 
  Person, 
  Send, 
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Tune,
  Sort
} from '@mui/icons-material';
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
  const [sortBy, setSortBy] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [amenities, setAmenities] = useState({
    'pet-friendly': false,
    'pool': false,
    'garage': false
  });

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
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
    const sort = searchParams.get('sort') || '';

    setLocationFilter(loc);
    setMinRent(minR);
    setMaxRent(maxR);
    setPropertyType(type);
    setFurnishingStatus(furnish);
    setSortBy(sort);

    if (am) {
      const amArray = am.split(',');
      setAmenities({
        'pet-friendly': amArray.includes('pet-friendly'),
        'pool': amArray.includes('pool'),
        'garage': amArray.includes('garage')
      });
    }

    fetchProperties(loc, minR, maxR, type, furnish, am, sort);
    
    // Auto-open property detail modal if info parameter exists in URL
    const autoOpenId = searchParams.get('info');
    if (autoOpenId) {
      handleGetInfoById(autoOpenId);
    }
  }, [searchParams]);

  const fetchProperties = async (loc, minR, maxR, type, furnish, amString, sort) => {
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
      let data = response.data;
      
      // Perform local sorting since backend might not support all sort modes
      if (sort) {
        if (sort === 'price-asc') {
          data.sort((a, b) => a.RentAmount - b.RentAmount);
        } else if (sort === 'price-desc') {
          data.sort((a, b) => b.RentAmount - a.RentAmount);
        } else if (sort === 'newest') {
          data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      }
      setProperties(data);
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
    if (sortBy) params.sort = sortBy;

    const selectedAmenities = Object.keys(amenities).filter(key => amenities[key]);
    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(',');
    }

    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setLocationFilter('');
    setMinRent('');
    setMaxRent('');
    setPropertyType('');
    setFurnishingStatus('');
    setSortBy('');
    setAmenities({
      'pet-friendly': false,
      'pool': false,
      'garage': false
    });
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleAmenityChange = (name) => {
    setAmenities(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleGetInfoById = async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      setSelectedProperty(response.data);
      setActiveImageIdx(0);
      setDetailOpen(true);
    } catch (error) {
      console.error(error);
      showToast('Could not load property details', 'error');
    }
  };

  const handleGetInfo = async (property) => {
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

  const images = selectedProperty?.Images && selectedProperty.Images.length > 0
    ? selectedProperty.Images.map(img => `http://localhost:5000${img}`)
    : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'];

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Page Title & Save Filter Action */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-5">
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                Search Rentals
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                Find available properties using the filters below.
              </p>
            </div>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="btn-househunt-outline d-flex align-items-center gap-2"
              style={{ fontSize: '0.85rem' }}
            >
              <Bookmark style={{ fontSize: '18px' }} />
              Save This Search
            </button>
          </div>

          <div className="row g-4">
            {/* Desktop Filters Sidebar */}
            <div className="col-12 col-lg-3 d-none d-lg-block">
              <div 
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'sticky',
                  top: '84px'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Filters</h2>
                  <Tune style={{ fontSize: '18px', color: 'var(--text-muted)' }} />
                </div>
                
                <form onSubmit={handleApplyFilters}>
                  {/* Location field */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Location
                    </label>
                    <input 
                      type="text"
                      className="form-control"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="City or location..."
                    />
                  </div>

                  {/* Monthly Rent ranges */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Monthly Rent ($)
                    </label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input 
                          type="number"
                          placeholder="Min"
                          className="form-control"
                          value={minRent}
                          onChange={(e) => setMinRent(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input 
                          type="number"
                          placeholder="Max"
                          className="form-control"
                          value={maxRent}
                          onChange={(e) => setMaxRent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Type Dropdown */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Property Type
                    </label>
                    <select 
                      className="form-select"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="">Any Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>

                  {/* Furnishing Status */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Furnishing Status
                    </label>
                    <select 
                      className="form-select"
                      value={furnishingStatus}
                      onChange={(e) => setFurnishingStatus(e.target.value)}
                    >
                      <option value="">Any Status</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  {/* Sort Option */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sort By
                    </label>
                    <select 
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="">Relevance</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest Listings</option>
                    </select>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Amenities
                    </label>
                    <div className="d-flex flex-column gap-2">
                      {Object.keys(amenities).map(key => (
                        <label key={key} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input 
                            type="checkbox"
                            checked={amenities[key]}
                            onChange={() => handleAmenityChange(key)}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <span style={{ textTransform: 'capitalize' }}>{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn-househunt-primary w-100 mb-2">Apply Filters</button>
                  <button type="button" onClick={handleClearFilters} className="btn-househunt-outline w-100">Clear</button>
                </form>
              </div>
            </div>

            {/* Mobile Filter Sticky Button */}
            <div className="col-12 d-lg-none mb-3">
              <div className="d-flex gap-2">
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="btn-househunt-outline flex-grow-1 py-2.5 d-flex align-items-center justify-content-center gap-2"
                >
                  <Tune style={{ fontSize: '16px' }} />
                  Filter Options
                </button>
                <select
                  className="form-select w-auto"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    const currentParams = Object.fromEntries(searchParams.entries());
                    if (e.target.value) {
                      currentParams.sort = e.target.value;
                    } else {
                      delete currentParams.sort;
                    }
                    setSearchParams(currentParams);
                  }}
                  style={{ width: '130px', padding: '8px 12px' }}
                >
                  <option value="">Sort</option>
                  <option value="price-asc">Price &uarr;</option>
                  <option value="price-desc">Price &darr;</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="col-12 col-lg-9">
              {loading ? (
                <div className="row">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div className="col-12 col-md-6 col-xl-4 mb-4" key={n}>
                      <div className="househunt-card skeleton-shimmer" style={{ height: '360px' }} />
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-5 rounded" style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="m-0 text-muted italic">No available properties match your filters.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {properties.map((property) => (
                    <div className="col-12 col-md-6 col-xl-4" key={property._id}>
                      <AllPropertiesCards 
                        property={property} 
                        onGetInfo={handleGetInfo}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom filter sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000000', zIndex: 100 }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                maxHeight: '80vh',
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                zIndex: 101,
                padding: '24px',
                overflowY: 'auto'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Filter Preferences</h3>
                <button className="bg-transparent border-0 text-white p-1" onClick={() => setShowMobileFilters(false)}>
                  <Close />
                </button>
              </div>

              <form onSubmit={handleApplyFilters}>
                {/* Location field */}
                <div className="mb-3">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Location</label>
                  <input type="text" className="form-control" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="City or area..." />
                </div>

                {/* Price min max */}
                <div className="mb-3">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Rent Budget ($)</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input type="number" className="form-control" placeholder="Min" value={minRent} onChange={(e) => setMinRent(e.target.value)} />
                    </div>
                    <div className="col-6">
                      <input type="number" className="form-control" placeholder="Max" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Type</label>
                    <select className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      <option value="">Any Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Furnishing</label>
                    <select className="form-select" value={furnishingStatus} onChange={(e) => setFurnishingStatus(e.target.value)}>
                      <option value="">Any Status</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Amenities</label>
                  <div className="d-flex gap-3 flex-wrap">
                    {Object.keys(amenities).map(key => (
                      <label key={key} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={amenities[key]} onChange={() => handleAmenityChange(key)} style={{ accentColor: 'var(--accent)' }} />
                        <span style={{ textTransform: 'capitalize' }}>{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="button" onClick={handleClearFilters} className="btn-househunt-outline flex-grow-1">Clear All</button>
                  <button type="submit" className="btn-househunt-primary flex-grow-1">Apply</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Property Details Inquiry Lightbox Dialog OVERLAY */}
      <AnimatePresence>
        {detailOpen && selectedProperty && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetail}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000000', zIndex: 110 }}
            />
            {/* Slide-up dialog container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: '5%',
                left: '5%',
                right: '5%',
                bottom: '5%',
                width: '90%',
                height: '90%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                zIndex: 111,
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
              }}
            >
              {/* Header */}
              <div 
                className="d-flex justify-content-between align-items-center p-4 sticky-top"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)',
                  zIndex: 5
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    {selectedProperty.Title}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    📍 {selectedProperty.Location}
                  </span>
                </div>
                <button 
                  onClick={handleCloseDetail}
                  className="bg-transparent border-0 text-white p-2 rounded-circle hover-btn"
                  style={{ backgroundColor: 'var(--bg-tertiary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Close style={{ fontSize: '20px' }} />
                </button>
              </div>

              {/* Grid content */}
              <div className="p-4 container-fluid">
                <div className="row g-4">
                  {/* Left content: Images & Specifications */}
                  <div className="col-12 col-md-7 col-lg-8">
                    {/* Main Image Lightbox view */}
                    <div style={{ position: 'relative', width: '100%', height: '340px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#000000' }}>
                      <img 
                        src={images[activeImageIdx]} 
                        alt="main-gallery" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(10, 10, 10, 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <ChevronLeft />
                          </button>
                          <button
                            onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(10, 10, 10, 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <ChevronRight />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                      <div className="d-flex gap-2 overflow-x-auto pb-3 mb-4">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            style={{
                              border: idx === activeImageIdx ? '2px solid var(--accent)' : '2px solid transparent',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              padding: 0,
                              background: 'transparent',
                              flexShrink: 0
                            }}
                          >
                            <img src={img} alt="thumb" style={{ width: '80px', height: '54px', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-4">
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Description</h4>
                      <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                        {selectedProperty.Description}
                      </p>
                    </div>

                    {/* Specs Grid */}
                    <div className="mb-4">
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Details & Specifications</h4>
                      <div className="row g-2">
                        <div className="col-6 col-sm-4">
                          <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                            <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Property Type</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedProperty.PropertyType}</span>
                          </div>
                        </div>
                        <div className="col-6 col-sm-4">
                          <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                            <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Furnishing</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedProperty.FurnishingStatus || 'Unspecified'}</span>
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderColor: 'var(--accent)' }}>
                            <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Monthly Rent</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>${selectedProperty.RentAmount}/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amenities Checklist */}
                    {selectedProperty.Amenities && selectedProperty.Amenities.length > 0 && (
                      <div className="mb-4">
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Amenities Included</h4>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedProperty.Amenities.map((amenity, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1.5 rounded-pill"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              ✓ {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Owner Info Profile details */}
                    <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
                        <Person style={{ color: 'var(--accent)', fontSize: '20px' }} />
                        Landlord / Owner Contact Information
                      </h4>
                      <div className="row g-3">
                        <div className="col-12 col-sm-4">
                          <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Name</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedProperty.OwnerID?.Name}</span>
                        </div>
                        <div className="col-12 col-sm-4">
                          <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Email</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Email style={{ fontSize: '14px', color: 'var(--text-secondary)' }} />
                            {selectedProperty.OwnerID?.Email}
                          </span>
                        </div>
                        <div className="col-12 col-sm-4">
                          <span className="d-block text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Phone</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone style={{ fontSize: '14px', color: 'var(--text-secondary)' }} />
                            {selectedProperty.OwnerID?.Phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right sticky forms */}
                  <div className="col-12 col-md-5 col-lg-4">
                    <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Booking Inquiry panel */}
                      <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
                          <CalendarMonth style={{ color: 'var(--accent)' }} />
                          Request Inquiry / Booking
                        </h4>
                        <form onSubmit={handleInquirySubmit}>
                          <div className="mb-3">
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Start Date</label>
                            <input 
                              type="date"
                              required
                              className="form-control"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              disabled={inquiryLoading}
                            />
                          </div>
                          <div className="mb-4">
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>End Date</label>
                            <input 
                              type="date"
                              required
                              className="form-control"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              disabled={inquiryLoading}
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={inquiryLoading} 
                            className="btn-househunt-primary w-100 py-3"
                          >
                            {inquiryLoading ? 'Submitting...' : 'Request Booking Info'}
                          </button>
                        </form>
                      </div>

                      {/* Direct Message simulated Form */}
                      <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
                          <Email style={{ color: 'var(--accent)' }} />
                          Offline Message Owner
                        </h4>
                        <form onSubmit={handleSendMessage}>
                          <div className="mb-3">
                            <textarea 
                              rows="3"
                              required
                              className="form-control"
                              placeholder="Write a message to landlord..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              disabled={sendingMsg}
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={sendingMsg}
                            className="btn-househunt-outline w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                          >
                            <Send style={{ fontSize: '14px' }} />
                            {sendingMsg ? 'Sending...' : 'Send Message'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Save Search Modal overlay */}
      <AnimatePresence>
        {saveModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaveModalOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000000', zIndex: 120 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -30%)',
                width: '90%',
                maxWidth: '400px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                zIndex: 121,
                boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
              }}
            >
              <h3 style={{ fontSize: '1.10rem', fontWeight: 600, marginBottom: '8px' }}>Save Search Filters</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Assign a custom label name to save your current filter preferences.
              </p>
              
              <div className="mb-4">
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Hyderabad Apartments"
                  className="form-control"
                  value={savedSearchName}
                  onChange={(e) => setSavedSearchName(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button onClick={() => setSaveModalOpen(false)} className="btn-househunt-outline py-2 px-3">
                  Cancel
                </button>
                <button onClick={handleSaveSearch} className="btn-househunt-primary py-2 px-4">
                  Save Search
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AllProperties;
