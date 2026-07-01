const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-Password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.UserType)) {
      return res.status(403).json({ message: `Access denied. Role ${req.user ? req.user.UserType : 'guest'} is not authorized.` });
    }
    next();
  };
};

// Owner approval validation middleware
const checkApproved = (req, res, next) => {
  if (req.user && req.user.UserType === 'Owner' && !req.user.isApproved) {
    return res.status(403).json({ message: 'Your owner account is pending admin approval. You cannot perform this action yet.' });
  }
  next();
};

module.exports = { protect, authorize, checkApproved };
