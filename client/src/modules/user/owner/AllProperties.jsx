import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import api from '../../../utils/api';
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
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-5">
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                My Properties
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                Add, edit, or toggle listings and availability status.
              </p>
            </div>
            <Link
              to="/owner/add-property"
              className="btn-househunt-primary d-flex align-items-center gap-2"
              style={{ fontSize: '0.85rem' }}
            >
              <Add style={{ fontSize: '18px' }} />
              Add Property
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5 rounded" style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-muted mb-3 italic" style={{ fontSize: '0.85rem' }}>You have not listed any properties yet.</p>
              <Link to="/owner/add-property" className="btn-househunt-primary py-2 px-3" style={{ fontSize: '0.8rem' }}>
                List Your First Property
              </Link>
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
                      <th className="p-3 border-0">Type</th>
                      <th className="p-3 border-0">Rent</th>
                      <th className="p-3 border-0">Status</th>
                      <th className="p-3 border-0">Availability Action</th>
                      <th className="p-3 border-0 text-end">Actions</th>
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
                                {property.Location}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>{property.PropertyType}</td>
                        <td className="p-3" style={{ fontSize: '0.85rem' }}>${property.RentAmount}/mo</td>
                        <td className="p-3">
                          <span className={`status-badge ${property.Status.toLowerCase()}`}>
                            {property.Status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleStatus(property)}
                            className="btn btn-sm text-decoration-none d-inline-flex align-items-center gap-1 p-0 text-success"
                            style={{ fontSize: '0.8rem', fontWeight: 600, border: 'none', background: 'transparent' }}
                          >
                            {property.Status === 'Available' ? <ToggleOn style={{ fontSize: '24px' }} /> : <ToggleOff style={{ fontSize: '24px', color: 'var(--text-muted)' }} />}
                            {property.Status === 'Available' ? 'Set Booked' : 'Set Available'}
                          </button>
                        </td>
                        <td className="p-3 text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <Link 
                              to={`/owner/add-property?edit=${property._id}`}
                              className="btn btn-sm btn-outline-light p-1"
                              style={{ display: 'inline-flex', borderRadius: '4px', borderColor: 'var(--border)' }}
                            >
                              <Edit style={{ fontSize: '16px' }} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteProperty(property._id)}
                              className="btn btn-sm btn-outline-danger p-1"
                              style={{ display: 'inline-flex', borderRadius: '4px' }}
                            >
                              <Delete style={{ fontSize: '16px' }} />
                            </button>
                          </div>
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

export default AllProperties;
