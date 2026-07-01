const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { Name, Email, Phone, Password, UserType, CurrentLocation } = req.body;

    // Validation
    if (!Name || !Email || !Phone || !Password || !UserType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ Email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Profile Image upload check (multer)
    let ProfileImage = '';
    if (req.file) {
      ProfileImage = `/uploads/${req.file.filename}`;
    }

    // Determine Owner approval state
    // Owner is approved = false by default, Admin and Tenant isApproved = true
    const isApproved = UserType !== 'Owner';

    // Create user
    const user = await User.create({
      Name,
      Email,
      Phone,
      Password: hashedPassword,
      UserType,
      ProfileImage,
      CurrentLocation: CurrentLocation || '',
      isApproved,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Phone: user.Phone,
        UserType: user.UserType,
        ProfileImage: user.ProfileImage,
        CurrentLocation: user.CurrentLocation,
        isApproved: user.isApproved,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Validation
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      Name: user.Name,
      Email: user.Email,
      Phone: user.Phone,
      UserType: user.UserType,
      ProfileImage: user.ProfileImage,
      CurrentLocation: user.CurrentLocation,
      isApproved: user.isApproved,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Phone: user.Phone,
        UserType: user.UserType,
        ProfileImage: user.ProfileImage,
        CurrentLocation: user.CurrentLocation,
        isApproved: user.isApproved,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.Name = req.body.Name || user.Name;
      user.Phone = req.body.Phone || user.Phone;
      user.CurrentLocation = req.body.CurrentLocation || user.CurrentLocation;

      if (req.file) {
        user.ProfileImage = `/uploads/${req.file.filename}`;
      }

      // If user submits a password update
      if (req.body.Password) {
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(req.body.Password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        Name: updatedUser.Name,
        Email: updatedUser.Email,
        Phone: updatedUser.Phone,
        UserType: updatedUser.UserType,
        ProfileImage: updatedUser.ProfileImage,
        CurrentLocation: updatedUser.CurrentLocation,
        isApproved: updatedUser.isApproved,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Save search filters
// @route   POST /api/users/saved-searches
// @access  Private/Tenant
const saveSearch = async (req, res) => {
  try {
    const { query, name } = req.body;
    if (!name || !query) {
      return res.status(400).json({ message: 'Please provide a name and search query parameters' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.SavedSearches.push({ query, name });
    await user.save();
    res.status(201).json(user.SavedSearches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving search', error: error.message });
  }
};

// @desc    Get saved searches
// @route   GET /api/users/saved-searches
// @access  Private/Tenant
const getSavedSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.SavedSearches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting saved searches', error: error.message });
  }
};

// @desc    Delete a saved search
// @route   DELETE /api/users/saved-searches/:searchId
// @access  Private/Tenant
const deleteSavedSearch = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.SavedSearches = user.SavedSearches.filter(s => s._id.toString() !== req.params.searchId);
    await user.save();
    res.json({ message: 'Saved search deleted successfully', savedSearches: user.SavedSearches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting saved search', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
};
