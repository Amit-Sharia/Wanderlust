const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in first");
    return res.redirect("/users/login");
  }
  return next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect(`/listings/${id}`);
  }

  // `req.user` is present because isLoggedIn runs before isOwner in your routes
  const currentUserId = req.user?._id;

  // If owner is missing (legacy data), treat as not permitted
  if (!listing.owner || !currentUserId || !listing.owner.equals(currentUserId)) {
    req.flash("error", "you dont have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }

  return next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  const currentUserId = req.user?._id;
  if (!review.owner || !currentUserId || !review.owner.equals(currentUserId)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }

  return next();
};
