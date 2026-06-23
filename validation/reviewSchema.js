const Joi = require('joi');

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().min(1).required(),
}).required();

module.exports = reviewSchema;

