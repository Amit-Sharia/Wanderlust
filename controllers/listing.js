const path = require("path");
const mongoose = require("mongoose");
const Listing = require("../models/listing");

const buildImageData = (file) => {
  if (!file) return undefined;

  if (typeof file.path === "string" && file.path.startsWith("http")) {
    return { url: file.path, filename: file.filename };
  }

  if (typeof file.path === "string") {
    const filename = file.filename || path.basename(file.path);
    return {
      url: `/uploads/${filename}`,
      filename,
    };
  }

  return undefined;
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

  module.exports.new =(req, res) => {
  res.render("listings/new.ejs");
};

module.exports.create = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = buildImageData(req.file);
    }

    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
  };

module.exports.edit=async (req, res) => {
    req.flash("success","listing edited");
    res.render("listings/edit.ejs", { listed: req.listed });
  };

module.exports.update = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const updateData = { ...req.body.listing };
    if (req.file) {
      updateData.image = buildImageData(req.file);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updateData,
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

module.exports.read =async (req, res) => {
    const { id } = req.params;

    // Always render using the Listing we fetched (ensures `listed` is present for show.ejs)
    const listing = await Listing.findById(id)
      .populate( {path :"reviews",
        populate :{
          path: "owner",
      }})
      .populate("owner");

    if (!listing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }

    res.render("listings/show.ejs", { listed: listing });
  }