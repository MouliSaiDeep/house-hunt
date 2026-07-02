const Property = require('../models/PropertySchema');
const BookingHistory = require('../models/BookingHistorySchema');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

// @desc    Get all available properties with filters
// @route   GET /api/properties
// @access  Public (Optional auth)
const getProperties = async (req, res) => {
  try {
    const { location, minRent, maxRent, propertyType, furnishingStatus, amenities } = req.query;
    
    // Build query object
    let query = { Status: 'Available' };

    // Filter by location (case-insensitive regex)
    if (location) {
      query.Location = { $regex: location, $options: 'i' };
    }

    // Filter by price range
    if (minRent || maxRent) {
      query.RentAmount = {};
      if (minRent) query.RentAmount.$gte = Number(minRent);
      if (maxRent) query.RentAmount.$lte = Number(maxRent);
    }

    // Filter by property type
    if (propertyType) {
      query.PropertyType = propertyType;
    }

    // Filter by furnishing status
    if (furnishingStatus) {
      query.FurnishingStatus = furnishingStatus;
    }

    // Filter by amenities (array match)
    if (amenities) {
      // If amenities is passed as a string or array, parse it
      const amenitiesList = Array.isArray(amenities) 
        ? amenities 
        : amenities.split(',').map(item => item.trim());
        
      if (amenitiesList.length > 0) {
        query.Amenities = { $all: amenitiesList };
      }
    }

    const properties = await Property.find(query).populate('OwnerID', 'Name Email Phone');
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing properties', error: error.message });
  }
};

// @desc    Get property by ID and log history if user is authenticated
// @route   GET /api/properties/:id
// @access  Public (Optional auth header logs history)
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('OwnerID', 'Name Email Phone');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Log view to BookingHistory if authenticated
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log('Optional token decoding failed in property details route:', err.message);
      }
    }

    if (userId) {
      // Log view
      await BookingHistory.create({
        UserID: userId,
        PropertyID: property._id,
        ViewedOn: new Date(),
      });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching property details', error: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
};
