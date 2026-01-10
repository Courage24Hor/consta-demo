const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/authMiddleware');

// @desc    Submit a contact form inquiry
// @route   POST /api/contacts
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, message } = req.body;

      const contact = await Contact.create({
        name,
        email,
        phone,
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Inquiry received successfully. We will contact you soon.',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Get all inquiries
// @route   GET /api/contacts
// @access  Private/Admin
router.get('/', protect, async (req, res, next) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
