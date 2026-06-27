const mongoose = require("mongoose");
const Listing =require("../models/listing");

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

module.exports.create=async (req, res) => {
    const listingData = req.body?.listing || {};
    const newListing = new Listing(listingData);
    if (req.file) {
      newListing.image = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      };
    }
    newListing.owner = req.user._id; // ensure owner is set for populated owner + relationships
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings");
  };

module.exports.edit=async (req, res) => {
    req.flash("success","listing edited");
    res.render("listings/edit.ejs", { listed: req.listed });
  };

module.exports.new =(req, res) => {
  res.render("listings/new.ejs");
};

module.exports.update = async (req, res) => {
    const { id } = req.params;

    // Extra safety (also handled by validateIdAndListing in GET routes)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const listingData = req.body?.listing || {};

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...listingData },
      { runValidators: true, new: true }
    );

    if (!updatedListing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }
    if (req.file) {
      updatedListing.image = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      };
      await updatedListing.save();
    }

    req.flash("success","listing Updated");
    res.redirect(`/listings/${id}`);
  }

module.exports.delete = async (req, res) => {
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
  }

module.exports.read = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "owner",
        },
      })
      .populate("owner");

    if (!listing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }

    res.render("listings/show.ejs", { listed: listing });
  }
