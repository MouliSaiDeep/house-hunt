const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, saveSearch, getSavedSearches, deleteSavedSearch } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public authentication routes
router.post('/register', upload.single('ProfileImage'), registerUser);
router.post('/login', loginUser);

// Protected profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('ProfileImage'), updateUserProfile);

// Saved searches routes (Tenants only)
router.post('/saved-searches', protect, authorize('Tenant'), saveSearch);
router.get('/saved-searches', protect, authorize('Tenant'), getSavedSearches);
router.delete('/saved-searches/:searchId', protect, authorize('Tenant'), deleteSavedSearch);

module.exports = router;
