const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getMyHistory } = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Booking operations
router.post('/', authorize('Tenant'), createBooking);
router.get('/', authorize('Tenant'), getMyBookings);
router.put('/:id/cancel', authorize('Tenant'), cancelBooking);

// View History (available to all logged-in roles)
router.get('/history', getMyHistory);

module.exports = router;
