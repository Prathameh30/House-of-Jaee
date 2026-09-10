// controllers/contactController.js
const { ContactModel, NewsletterModel } = require('../models/contactModel');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/contact
exports.submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  await ContactModel.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, message: 'Thank you for reaching out! We will get back to you soon.' });
});

// POST /api/newsletter/subscribe
exports.subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  await NewsletterModel.subscribe(email.toLowerCase().trim());
  res.status(201).json({ success: true, message: 'Subscribed successfully!' });
});

// ---- Admin-only ----

// GET /api/admin/contact-messages
exports.getAllMessagesAdmin = asyncHandler(async (req, res) => {
  const messages = await ContactModel.findAll();
  res.json({ success: true, messages });
});

// PUT /api/admin/contact-messages/:id/read
exports.markMessageRead = asyncHandler(async (req, res) => {
  await ContactModel.markRead(req.params.id);
  res.json({ success: true, message: 'Marked as read.' });
});
