const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Listing = require("../models/listing");
const Review = require("../models/review");

const asyncHandler = require("../utils/asyncHandler");

const { validateIdAndListing } = require("../middleware/validateIdAndListing");
const { validateReview } = require("../middleware/validateReview");
const { isLoggedIn, isReviewAuthor } = require("../middleware/middleware");


//controllers :)
const reviewController=require("../controllers/reviews");

// Reviews - Read (review form)
router.get("/:id/reviews",isLoggedIn,validateIdAndListing,asyncHandler(reviewController.read));

// Reviews - Create
router.post("/:id/reviews",isLoggedIn,validateIdAndListing,validateReview,asyncHandler(reviewController.create));

// Reviews - Delete
router.delete("/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor,asyncHandler(reviewController.delete));


module.exports = router;

