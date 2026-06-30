const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Phone: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  UserType: {
    type: String,
    enum: ['Tenant', 'Owner', 'Admin'],
    required: true,
  },
  ProfileImage: {
    type: String,
    default: '',
  },
  CurrentLocation: {
    type: String,
    default: '',
  },
  isApproved: {
    type: Boolean,
    default: true, // Will be set to false for Owner on creation
  },
  SavedSearches: [{
    query: {
      type: mongoose.Schema.Types.Mixed,
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
