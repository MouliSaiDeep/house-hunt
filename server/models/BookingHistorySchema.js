const mongoose = require('mongoose');

const BookingHistorySchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  PropertyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  BookingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false, // Optional if it was a property view before booking
  },
  ViewedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BookingHistory', BookingHistorySchema);
