const express = require('express');
const router = express.Router();
const {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getMyPropertyBookings,
  updateBookingStatus,
} = require('../controllers/ownerController');
const { protect, authorize, checkApproved } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Require authentication, owner check, and account approval status
router.use(protect);
router.use(authorize('Owner'));
router.use(checkApproved);

// Property CRUD
router.post('/properties', upload.array('Images', 5), createProperty);
router.get('/properties', getMyProperties);
router.put('/properties/:id', upload.array('Images', 5), updateProperty);
router.delete('/properties/:id', deleteProperty);

// Bookings management
router.get('/bookings', getMyPropertyBookings);
router.put('/bookings/:id', updateBookingStatus);

module.exports = router;
