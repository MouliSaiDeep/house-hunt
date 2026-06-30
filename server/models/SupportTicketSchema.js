const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Subject: {
    type: String,
    required: true,
  },
  Message: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
