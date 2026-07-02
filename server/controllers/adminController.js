const User = require('../models/UserSchema');
const Property = require('../models/PropertySchema');
const Booking = require('../models/BookingSchema');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-Password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing users', error: error.message });
  }
};

// @desc    Approve/Reject Owner account
// @route   PUT /api/admin/approve-owner/:id
// @access  Private/Admin
const approveOwner = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.UserType !== 'Owner') {
      return res.status(400).json({ message: 'User is not an Owner' });
    }

    user.isApproved = !user.isApproved; // Toggle approval
    await user.save();

    res.json({
      message: `Owner approval status updated successfully. isApproved: ${user.isApproved}`,
      user: {
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        UserType: user.UserType,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling owner approval', error: error.message });
  }
};

// @desc    Delete user (enforce platform policy)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
};

// @desc    Get all properties (moderate)
// @route   GET /api/admin/properties
// @access  Private/Admin
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({}).populate('OwnerID', 'Name Email Phone');
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing properties', error: error.message });
  }
};

// @desc    Delete any property listing
// @route   DELETE /api/admin/properties/:id
// @access  Private/Admin
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property listing removed by admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting property', error: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('PropertyID')
      .populate('TenantID', 'Name Email Phone');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing bookings', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  approveOwner,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
};
