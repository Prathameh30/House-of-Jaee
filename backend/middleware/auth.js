// middleware/auth.js
// Two guards: one requiring an ADMIN-role token, one requiring a CUSTOMER-role token.
// Also exports an "optionalAuth" used on routes that work for guests too.

const { verifyToken } = require('../utils/jwt');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return null;
}

function requireAdmin(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Admin login required.' });
  }
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function requireCustomer(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
  }
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'CUSTOMER') {
      return res.status(403).json({ success: false, message: 'Access denied. Customers only.' });
    }
    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// For routes that behave differently for logged-in customers vs guests,
// but never block the request if there's no/invalid token.
function optionalCustomerAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    if (decoded.role === 'CUSTOMER') {
      req.customer = decoded;
    }
  } catch (err) {
    // Silently ignore — treat as guest.
  }
  next();
}

module.exports = { requireAdmin, requireCustomer, optionalCustomerAuth };
