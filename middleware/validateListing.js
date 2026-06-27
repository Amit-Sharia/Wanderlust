const { listingSchema } = require('../validation/listingSchema');

function validateListing(req, res, next) {
  if (!req.body || !req.body.listing) {
    const error = new Error('Listing data is missing from the form submission.');
    error.statusCode = 400;
    error.expose = true;
    return next(error);
  }

  const { error, value } = listingSchema.validate(req.body.listing, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    // Attach useful info for centralized error rendering
    error.statusCode = 400;
    error.expose = true;
    return next(error);
  }

  // Replace body with sanitized value
  req.body.listing = value;
  next();
}

module.exports = { validateListing };

