const Joi = require('joi');

// Joi schema for listing payloads coming from forms.
// Your form sends: req.body.listing with keys:
// title, description, image: { url }, price, location, country
const listingSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().trim().allow('').optional(),
  image: Joi.object({
    url: Joi.string()
      .pattern(/^(https?:\/\/|\/uploads\/).+/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Image must be a valid URL or uploaded image path',
      }),
    filename: Joi.string().optional().allow(''),
  }).optional(),
  price: Joi.number().min(0).required(),
  location: Joi.string().trim().min(1).required(),
  country: Joi.string().trim().min(1).required(),
}).required();

module.exports = { listingSchema };


