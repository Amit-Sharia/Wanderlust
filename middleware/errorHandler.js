const { MongooseError } = require('mongoose');

function errorHandler(err, req, res, next) {
  // Mongoose validation errors
  if (err && err.name === 'ValidationError') {
    return res.status(400).render('error', {
      statusCode: 400,
      message: err.message || 'Validation error',
      error: err,
    });
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err && err.name === 'CastError') {
    return res.status(404).render('error', {
      statusCode: 404,
      message: 'Resource not found (invalid id).',
      error: err,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong.';

  // If you don't have a dedicated error page, fall back to plain text.
  return res.status(statusCode).render('error', {
    statusCode,
    message,
    error: err,
  });
}

module.exports = errorHandler;

