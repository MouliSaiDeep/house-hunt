import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LocationOn, 
  Favorite, 
  FavoriteBorder, 
  ChevronLeft, 
  ChevronRight,
  Apartment
} from '@mui/icons-material';

const AllPropertiesCards = ({ property, onGetInfo }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = property.Images && property.Images.length > 0
    ? property.Images.map(img => `http://localhost:5000${img}`)
    : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'];

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="househunt-card h-100 d-flex flex-column"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      {/* Image Carousel */}
      <div 
        className="image-zoom-container" 
        style={{ height: '220px', position: 'relative', overflow: 'hidden' }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImageIndex}
            src={images[activeImageIndex]}
            alt={property.Title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AnimatePresence>

        {/* Heart Icon Button */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(10, 10, 10, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? 'var(--danger)' : '#ffffff',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            zIndex: 5
          }}
        >
          {isFavorite ? (
            <Favorite className="heart-bounce" style={{ fontSize: '18px' }} />
          ) : (
            <FavoriteBorder style={{ fontSize: '18px' }} />
          )}
        </button>

        {/* Featured / New Badge */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(34, 197, 94, 0.9)',
            color: '#000000',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            zIndex: 5,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          new
        </div>

        {/* Carousel Arrows on Hover */}
        {images.length > 1 && hovered && (
          <>
            <button
              onClick={handlePrevImage}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(10, 10, 10, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 6
              }}
            >
              <ChevronLeft style={{ fontSize: '20px' }} />
            </button>
            <button
              onClick={handleNextImage}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(10, 10, 10, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 6
              }}
            >
              <ChevronRight style={{ fontSize: '20px' }} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              zIndex: 6
            }}
          >
            {images.map((_, idx) => (
              <div 
                key={idx}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: idx === activeImageIndex ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span 
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '3px 8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {property.PropertyType}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
            ${property.RentAmount}/mo
          </span>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
          {property.Title}
        </h3>

        <div className="d-flex align-items-center text-muted mb-3" style={{ fontSize: '0.75rem' }}>
          <LocationOn style={{ fontSize: '14px', marginRight: '4px', color: 'var(--text-secondary)' }} />
          {property.Location}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
          {property.Description}
        </p>

        {/* Specific specifications flex bar */}
        <div 
          className="d-flex gap-3 mb-4 mt-auto py-2 px-3 rounded" 
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            border: '1px solid var(--border)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div>🛏 {property.FurnishingStatus || 'Furnished'}</div>
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
          <div style={{ textTransform: 'capitalize' }}>📍 {(property.Location || '').split(',')[0] || 'N/A'}</div>
        </div>

        <button
          onClick={() => onGetInfo(property)}
          className="btn-househunt-primary w-100 py-2.5"
          style={{ borderRadius: '8px' }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default AllPropertiesCards;
