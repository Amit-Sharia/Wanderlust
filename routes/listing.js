const express = require("express");
const router = express.Router();

// ======================
// Requirements (needed by routes)
// ======================
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");

const asyncHandler = require("../utils/asyncHandler");

const { validateListing } = require("../middleware/validateListing");
const { validateIdAndListing } = require("../middleware/validateIdAndListing");

// ======================
// Listings - Read
// ======================

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// ======================
// Listings - Create
// ======================
router.post(
  "/",
  validateListing,
  asyncHandler(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings");
  })
);

// ======================
// Listings - Edit (form)
// ======================
router.get(
  "/:id/edit",
  validateIdAndListing,
  asyncHandler(async (req, res) => {
    req.flash("success","listing edited");
    res.render("listings/edit.ejs", { listed: req.listed });
  })
);

// ======================
// Listings - Update
// ======================
router.put(
  "/:id",
  validateListing,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Extra safety (also handled by validateIdAndListing in GET routes)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true, new: true }
    );

    if (!updatedListing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }
    req.flash("success","listing Updated");
    res.redirect(`/listings/${id}`);
  })
);

// ======================
// Listings - Delete
// ======================
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }
    req.flash("success","listing deleted");
    res.redirect("/listings");
  })
);

// ======================
// Listings - Read (details)
// ======================
router.get(
  "/:id",
  // validateIdAndListing, just commenting the middlewaare so that flash can work
  asyncHandler(async (req, res) => {
    // validateIdAndListing should populate req.listed when the listing exists
    if (!req.listed) {
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listed: req.listed });
  })
);


module.exports = router;

