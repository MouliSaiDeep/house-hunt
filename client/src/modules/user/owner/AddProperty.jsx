import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
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
  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  })();

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

  const handleAmenityChange = (name) => {
    setAmenities(prev => ({ ...prev, [name]: !prev[name] }));
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
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }} className="text-center">
          <div className="spinner-border text-success" role="status" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          <div className="mb-4">
            <button 
              onClick={() => navigate('/owner/properties')}
              className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
              style={{ fontSize: '0.85rem' }}
            >
              <ArrowBack style={{ fontSize: '18px' }} />
              Back to Listings
            </button>
          </div>

          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <div 
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}
            >
              <div className="mb-4">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                  {editId ? 'Edit Property Listing' : 'Add Rental Property'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
                  Provide details about your property to find renters.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Title */}
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Property Title *</label>
                    <input 
                      type="text" 
                      name="Title"
                      required
                      placeholder="e.g. Modern 2 BHK Apartment in Downtown"
                      value={formData.Title}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-control"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detailed Description *</label>
                    <textarea 
                      name="Description"
                      required
                      rows="4"
                      placeholder="Write about the rooms, local context, utilities, distance to transport, etc."
                      value={formData.Description}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-control"
                    />
                  </div>

                  {/* Location */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Location / Area *</label>
                    <input 
                      type="text" 
                      name="Location"
                      required
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                      value={formData.Location}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-control"
                    />
                  </div>

                  {/* Rent */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Rent Amount ($) *</label>
                    <input 
                      type="number" 
                      name="RentAmount"
                      required
                      placeholder="e.g. 1200"
                      value={formData.RentAmount}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-control"
                    />
                  </div>

                  {/* Type */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Property Type *</label>
                    <select 
                      name="PropertyType"
                      value={formData.PropertyType}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-select"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>

                  {/* Furnishing */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Furnishing Status *</label>
                    <select 
                      name="FurnishingStatus"
                      value={formData.FurnishingStatus}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-select"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  {/* Amenities */}
                  <div className="col-12">
                    <label className="form-label d-block mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amenities Included</label>
                    <div className="d-flex gap-3 flex-wrap">
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

                  {/* File Upload */}
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Property Images {editId ? '(Select new files to replace images)' : '*'}
                    </label>
                    <label 
                      className="btn-househunt-outline w-100 py-3"
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <PhotoCamera style={{ fontSize: '18px' }} />
                      <span>
                        {images.length > 0 
                          ? `${images.length} file(s) selected` 
                          : 'Upload Property Images'
                        }
                      </span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-househunt-primary w-100 py-3"
                    >
                      {loading ? 'Submitting...' : editId ? 'Save Changes' : 'List Property'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProperty;
