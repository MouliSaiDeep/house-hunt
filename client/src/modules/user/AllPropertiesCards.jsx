import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const AllPropertiesCards = ({ property, onGetInfo }) => {
  const imageUrl = property.Images && property.Images.length > 0
    ? `http://localhost:5000${property.Images[0]}`
    : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80';

  return (
    <Card 
      className="househunt-card h-100 d-flex flex-column"
      sx={{ height: '100%' }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={property.Title}
        style={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3, d: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={property.PropertyType} 
            size="small" 
            sx={{ bgcolor: 'var(--primary-light)', color: 'white', fontWeight: '500' }} 
          />
          <Typography variant="h6" sx={{ fontWeight: '800', color: 'var(--accent-color)' }}>
            ${property.RentAmount}/mo
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: '700', 
            mb: 1, 
            fontSize: '1.1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {property.Title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" className="d-flex align-items-center mb-2">
          <LocationOn sx={{ fontSize: '16px', mr: 0.5, color: 'var(--text-muted)' }} />
          {property.Location}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'var(--text-muted)', 
            mb: 3, 
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {property.Description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Button
            fullWidth
            onClick={() => onGetInfo(property)}
            variant="contained"
            sx={{
              bgcolor: 'var(--primary-color)',
              color: 'white',
              textTransform: 'none',
              fontFamily: 'Manrope',
              fontWeight: '600',
              py: 1,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'var(--primary-light)',
                boxShadow: 'none'
              }
            }}
          >
            Get Info
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AllPropertiesCards;
