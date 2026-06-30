const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  OwnerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  RentAmount: {
    type: Number,
    required: true,
  },
  PropertyType: {
    type: String, // e.g. Apartment, House, Studio
    required: true,
  },
  FurnishingStatus: {
    type: String,
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    required: true,
  },
  Amenities: {
    type: [String],
    default: [],
  },
  Images: {
    type: [String],
    default: [],
  },
  Status: {
    type: String,
    enum: ['Available', 'Booked'],
    default: 'Available',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Property', PropertySchema);
