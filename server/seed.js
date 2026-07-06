const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Config
const MONGO_URI = 'mongodb://127.0.0.1:27017/househunt';

// Import Schemas
const User = require('./models/UserSchema');
const Property = require('./models/PropertySchema');
const Booking = require('./models/BookingSchema');
const BookingHistory = require('./models/BookingHistorySchema');

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Seed: Connected to MongoDB');

    // Clean DB
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await BookingHistory.deleteMany({});
    console.log('Seed: Database cleared');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('adminpassword', salt);
    const ownerPassword = await bcrypt.hash('ownerpassword', salt);
    const tenantPassword = await bcrypt.hash('tenantpassword', salt);

    // Create Admin
    const admin = await User.create({
      Name: 'System Admin',
      Email: 'admin@example.com',
      Phone: '1234567890',
      Password: adminPassword,
      UserType: 'Admin',
      isApproved: true,
      CurrentLocation: 'New York'
    });
    console.log('Seed: Created Admin user');

    // Create Approved Owner
    const owner = await User.create({
      Name: 'John Landlord',
      Email: 'owner@example.com',
      Phone: '9876543210',
      Password: ownerPassword,
      UserType: 'Owner',
      isApproved: true,
      CurrentLocation: 'Hyderabad'
    });
    console.log('Seed: Created Approved Owner user');

    // Create Unapproved Owner
    const unapprovedOwner = await User.create({
      Name: 'Dave Newhost',
      Email: 'unapproved@example.com',
      Phone: '5551234567',
      Password: ownerPassword,
      UserType: 'Owner',
      isApproved: false,
      CurrentLocation: 'Chicago'
    });
    console.log('Seed: Created Unapproved Owner user');

    // Create Tenant
    const tenant = await User.create({
      Name: 'Alice Renter',
      Email: 'tenant@example.com',
      Phone: '4445556666',
      Password: tenantPassword,
      UserType: 'Tenant',
      isApproved: true,
      CurrentLocation: 'New York'
    });
    console.log('Seed: Created Tenant user');

    // Create Properties for John Landlord
    const prop1 = await Property.create({
      OwnerID: owner._id,
      Title: 'Cozy 1 BHK in Jubilee Hills',
      Description: 'Beautifully furnished 1 bedroom apartment with great ventilation, near public transport and schools.',
      Location: 'Hyderabad',
      RentAmount: 600,
      PropertyType: 'Apartment',
      FurnishingStatus: 'Furnished',
      Amenities: ['pet-friendly', 'pool'],
      Status: 'Available'
    });

    const prop2 = await Property.create({
      OwnerID: owner._id,
      Title: 'Spacious Studio near Central Park',
      Description: 'Modern studio flat with modular kitchen and private balcony. Perfect for students and couples.',
      Location: 'New York',
      RentAmount: 1500,
      PropertyType: 'Studio',
      FurnishingStatus: 'Semi-Furnished',
      Amenities: ['garage'],
      Status: 'Available'
    });
    console.log('Seed: Created properties');

    console.log('Seed database initialized successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
