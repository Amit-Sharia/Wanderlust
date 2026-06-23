const mongoose = require('mongoose');
const Listing = require('../models/listing');

// Usage:
// app.get('/listings/:id', validateIdAndListing, (req,res)=>{ ... req.listed ... })
// Exposes: req.listed
function validateIdAndListing(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('error', { statusCode: 404, message: 'Resource not found (invalid id).' });
  }

  return Listing.findById(id)
    .populate('reviews')
    .then((listed) => {
      if (!listed) {
        return res.status(404).render('error', { statusCode: 404, message: 'Listing not found.' });
      }
      req.listed = listed;
      next();
    })
    .catch(next);
}

module.exports = { validateIdAndListing };

