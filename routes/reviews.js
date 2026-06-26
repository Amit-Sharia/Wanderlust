const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Listing = require("../models/listing");
const Review = require("../models/review");

const asyncHandler = require("../utils/asyncHandler");

const { validateIdAndListing } = require("../middleware/validateIdAndListing");
const { validateReview } = require("../middleware/validateReview");
const { isLoggedIn, isReviewAuthor } = require("../middleware/middleware");

// ======================
// Reviews - Read (review form)
// ======================
router.get(
  "/:id/reviews",
  isLoggedIn,
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
  isLoggedIn,
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
    newReview.owner =req.user._id;

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
  isLoggedIn,
  isReviewAuthor,
  asyncHandler(async (req, res) => {
    const { id, reviewId } = req.params;

    // If review doesn't exist, don't crash
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      req.flash("error", "Review not found.");
      return res.redirect(`/listings/${id}`);
    }

    // Remove review id from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;

