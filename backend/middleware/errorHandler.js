// middleware/errorHandler.js
// Centralized error handler — keeps controllers free of repetitive try/catch boilerplate
// when used together with asyncHandler.

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Must be registered LAST in server.js (after all routes).
function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err.message);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry. This record already exists.' });
  }

  // MySQL foreign key violations
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ success: false, message: 'This action conflicts with related records.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { asyncHandler, errorHandler, notFound };
