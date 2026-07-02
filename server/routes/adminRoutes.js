const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  approveOwner,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes here are restricted to logged-in Admins
router.use(protect);
router.use(authorize('Admin'));

// User management
router.get('/users', getAllUsers);
router.put('/approve-owner/:id', approveOwner);
router.delete('/users/:id', deleteUser);

// Property moderation
router.get('/properties', getAllProperties);
router.delete('/properties/:id', deleteProperty);

// Booking view
router.get('/bookings', getAllBookings);

module.exports = router;
