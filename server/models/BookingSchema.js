const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  PropertyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  TenantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  StartDate: {
    type: Date,
    required: true,
  },
  EndDate: {
    type: Date,
    required: true,
  },
  BookingDate: {
    type: Date,
    default: Date.now,
  },
  Status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', BookingSchema);
