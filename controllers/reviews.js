const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.read =async (req, res) => {
    res.render("listings/review.ejs", { listed: req.listed });
  };

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const { review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    // Check if user already submitted a review for this listing
    const alreadyReviewed = listing.reviews.some(
      (existingReview) =>
        existingReview.owner && existingReview.owner.equals(req.user._id)
    );

    if (alreadyReviewed) {
      req.flash("error", "You have already submitted a review for this stay.");
      return res.redirect(`/listings/${id}`);
    }

    const newReview = new Review(review);
    newReview.owner = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "New review added successfully.");
    res.redirect(`/listings/${id}?review=1`);
  };


module.exports.delete= async (req, res) => {
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
  };