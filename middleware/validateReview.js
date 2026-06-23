const reviewSchema = require('../validation/reviewSchema');

function validateReview(req, res, next) {
  const { error, value } = reviewSchema.validate(req.body.review, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    error.statusCode = 400;
    error.expose = true;
    return next(error);
  }

  req.body.review = value;
  next();
}

module.exports = { validateReview };

