import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';
import api from '../../utils/api';
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
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="mb-5">
            <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
              System Property Listings
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
              Moderate listings and delete listings violating platform terms.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5 rounded" style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-muted m-0 italic" style={{ fontSize: '0.85rem' }}>No properties listed on the platform.</p>
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
                      <th className="p-3 border-0">Landlord Details</th>
                      <th className="p-3 border-0">Type</th>
                      <th className="p-3 border-0">Monthly Rent</th>
                      <th className="p-3 border-0">Status</th>
                      <th className="p-3 border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property._id} style={{ verticalAlign: 'middle' }}>
                        <td className="p-3">
                          <div className="d-flex align-items-center gap-3">
                            {property.Images && property.Images.length > 0 ? (
                              <img 
                                src={`http://localhost:5000${property.Images[0]}`} 
                                alt={property.Title} 
                                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                              />
                            ) : (
                              <div style={{ width: '60px', height: '40px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border)' }} />
                            )}
                            <div>
                              <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {property.Title}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Location: {property.Location}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="d-block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {property.OwnerID?.Name || 'Deleted User'}
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            {property.OwnerID?.Email}
                          </span>
                        </td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>{property.PropertyType}</td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>${property.RentAmount}/mo</td>
                        <td className="p-3">
                          <span className={`status-badge ${property.Status.toLowerCase()}`}>
                            {property.Status}
                          </span>
                        </td>
                        <td className="p-3 text-end">
                          <button 
                            onClick={() => handleDeleteListing(property._id)}
                            className="btn btn-sm btn-outline-danger p-1"
                            style={{ display: 'inline-flex', borderRadius: '4px' }}
                          >
                            <Delete style={{ fontSize: '16px' }} />
                          </button>
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

export default AllProperty;
