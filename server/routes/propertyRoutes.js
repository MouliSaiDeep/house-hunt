const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById } = require('../controllers/propertyController');

router.get('/', getProperties);
router.get('/:id', getPropertyById);

module.exports = router;
