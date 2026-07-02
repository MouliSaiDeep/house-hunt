const Booking = require('../models/BookingSchema');
const Property = require('../models/PropertySchema');
const BookingHistory = require('../models/BookingHistorySchema');

// @desc    Create a booking request (inquiry)
// @route   POST /api/bookings
// @access  Private/Tenant
const createBooking = async (req, res) => {
  try {
    const { PropertyID, StartDate, EndDate } = req.body;

    if (!PropertyID || !StartDate || !EndDate) {
      return res.status(400).json({ message: 'Please provide PropertyID, StartDate, and EndDate' });
    }

    // Check if property exists
    const property = await Property.findById(PropertyID);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.Status === 'Booked') {
      return res.status(400).json({ message: 'This property is already booked' });
    }

    // Create booking (status defaults to Pending)
    const booking = await Booking.create({
      PropertyID,
      TenantID: req.user._id,
      StartDate,
      EndDate,
      BookingDate: new Date(),
      Status: 'Pending',
    });

    // Also log this booking in BookingHistory
    await BookingHistory.create({
      UserID: req.user._id,
      PropertyID,
      BookingID: booking._id,
      ViewedOn: new Date(),
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating booking request', error: error.message });
  }
};

// @desc    Get tenant's bookings
// @route   GET /api/bookings
// @access  Private/Tenant
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ TenantID: req.user._id })
      .populate({
        path: 'PropertyID',
        populate: {
          path: 'OwnerID',
          select: 'Name Email Phone',
        },
      });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
};

// @desc    Cancel a booking request
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Tenant
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify tenant owns this booking
    if (booking.TenantID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    booking.Status = 'Cancelled';
    await booking.save();

    // Reset property to Available if it was confirmed before
    await Property.findByIdAndUpdate(booking.PropertyID, { Status: 'Available' });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
  }
};

// @desc    Get tenant's property viewing history
// @route   GET /api/bookings/history
// @access  Private
const getMyHistory = async (req, res) => {
  try {
    const history = await BookingHistory.find({ UserID: req.user._id })
      .populate({
        path: 'PropertyID',
        populate: {
          path: 'OwnerID',
          select: 'Name Email Phone',
        },
      })
      .sort({ ViewedOn: -1 })
      .limit(10);

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching view history', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getMyHistory,
};
