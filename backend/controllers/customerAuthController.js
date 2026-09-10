// controllers/customerAuthController.js
const bcrypt = require('bcryptjs');
const CustomerModel = require('../models/customerModel');
const { signToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/customer/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existing = await CustomerModel.findByEmail(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customerId = await CustomerModel.create({
    name,
    email: email.toLowerCase().trim(),
    hashedPassword,
    mobileNumber,
  });

  const token = signToken({ id: customerId, email, role: 'CUSTOMER' });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    customer: { id: customerId, name, email, mobileNumber },
  });
});

// POST /api/customer/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const customer = await CustomerModel.findByEmail(email.toLowerCase().trim());
  if (!customer) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = signToken({ id: customer.customer_id, email: customer.email, role: 'CUSTOMER' });

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    customer: {
      id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      mobileNumber: customer.mobile_number,
    },
  });
});

// GET /api/customer/auth/me
exports.getProfile = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findById(req.customer.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }
  res.json({ success: true, customer });
});
