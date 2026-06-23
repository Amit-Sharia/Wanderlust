const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Listing = require("../models/listing");
const Review = require("../models/review");

const asyncHandler = require("../utils/asyncHandler");

const { validateIdAndListing } = require("../middleware/validateIdAndListing");
const { validateReview } = require("../middleware/validateReview");

// ======================
// Reviews - Read (review form)
// ======================
router.get(
  "/:id/reviews",
  validateIdAndListing,
  asyncHandler(async (req, res) => {
    res.render("listings/review.ejs", { listed: req.listed });
  })
);

// ======================
// Reviews - Create
// ======================
router.post(
  "/:id/reviews",
  validateIdAndListing,
  validateReview,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { review } = req.body;

    // Extra safety (validateIdAndListing handles invalid ids)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    // Create review document
    const listing = await Listing.findById(id);
    const newReview = new Review(review);

    // Link + persist
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","new review created");
    res.redirect(`/listings/${id}?review=1`);
  })
);

// ======================
// Reviews - Delete
// ======================
router.delete(
  "/:id/reviews/:reviewId",
  asyncHandler(async (req, res) => {
    const { id, reviewId } = req.params;

    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;

