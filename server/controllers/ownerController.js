const Property = require('../models/PropertySchema');
const Booking = require('../models/BookingSchema');

// @desc    Create a property listing
// @route   POST /api/owner/properties
// @access  Private/Owner
const createProperty = async (req, res) => {
  try {
    const { Title, Description, Location, RentAmount, PropertyType, FurnishingStatus, Amenities } = req.body;

    if (!Title || !Description || !Location || !RentAmount || !PropertyType || !FurnishingStatus) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Process uploaded images
    let Images = [];
    if (req.files && req.files.length > 0) {
      Images = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Process amenities (might be comma separated string or array)
    let processedAmenities = [];
    if (Amenities) {
      processedAmenities = Array.isArray(Amenities)
        ? Amenities
        : Amenities.split(',').map(item => item.trim()).filter(item => item !== '');
    }

    const property = await Property.create({
      OwnerID: req.user._id,
      Title,
      Description,
      Location,
      RentAmount: Number(RentAmount),
      PropertyType,
      FurnishingStatus,
      Amenities: processedAmenities,
      Images,
      Status: 'Available',
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating property listing', error: error.message });
  }
};

// @desc    Get logged in owner's properties
// @route   GET /api/owner/properties
// @access  Private/Owner
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ OwnerID: req.user._id });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching owner properties', error: error.message });
  }
};

// @desc    Update owner's property
// @route   PUT /api/owner/properties/:id
// @access  Private/Owner
const updateProperty = async (req, res) => {
  try {
    const { Title, Description, Location, RentAmount, PropertyType, FurnishingStatus, Amenities, Status } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.OwnerID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this property.' });
    }

    property.Title = Title || property.Title;
    property.Description = Description || property.Description;
    property.Location = Location || property.Location;
    property.RentAmount = RentAmount ? Number(RentAmount) : property.RentAmount;
    property.PropertyType = PropertyType || property.PropertyType;
    property.FurnishingStatus = FurnishingStatus || property.FurnishingStatus;
    property.Status = Status || property.Status;

    if (Amenities) {
      property.Amenities = Array.isArray(Amenities)
        ? Amenities
        : Amenities.split(',').map(item => item.trim()).filter(item => item !== '');
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      property.Images = [...property.Images, ...newImages];
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating property listing', error: error.message });
  }
};

// @desc    Delete owner's property
// @route   DELETE /api/owner/properties/:id
// @access  Private/Owner
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.OwnerID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this property.' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting property listing', error: error.message });
  }
};

// @desc    Get bookings on owner's properties
// @route   GET /api/owner/bookings
// @access  Private/Owner
const getMyPropertyBookings = async (req, res) => {
  try {
    // Find all properties owned by this user
    const properties = await Property.find({ OwnerID: req.user._id });
    const propertyIds = properties.map(p => p._id);

    // Find all bookings for these properties
    const bookings = await Booking.find({ PropertyID: { $in: propertyIds } })
      .populate('PropertyID')
      .populate('TenantID', 'Name Email Phone');

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
};

// @desc    Update booking status (Confirm/Cancel)
// @route   PUT /api/owner/bookings/:id
// @access  Private/Owner
const updateBookingStatus = async (req, res) => {
  try {
    const { Status } = req.body; // Confirmed, Cancelled
    
    if (!Status || !['Confirmed', 'Cancelled'].includes(Status)) {
      return res.status(400).json({ message: 'Please provide a valid status (Confirmed or Cancelled)' });
    }

    const booking = await Booking.findById(req.params.id).populate('PropertyID');
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Verify owner owns this property
    if (booking.PropertyID.OwnerID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own the property for this booking.' });
    }

    booking.Status = Status;
    await booking.save();

    // If confirmed, update the property status to Booked
    if (Status === 'Confirmed') {
      await Property.findByIdAndUpdate(booking.PropertyID._id, { Status: 'Booked' });
    } else if (Status === 'Cancelled') {
      // If cancelled, reset the property back to Available if no other active confirmed bookings
      await Property.findByIdAndUpdate(booking.PropertyID._id, { Status: 'Available' });
    }

    res.json({ message: `Booking status updated to ${Status}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating booking status', error: error.message });
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getMyPropertyBookings,
  updateBookingStatus,
};
