const express = require("express");
const multer = require("multer");
const router = express.Router();

// Requirements (needed by routes)
const asyncHandler = require("../utils/asyncHandler");

const { validateListing } = require("../middleware/validateListing");
const { validateIdAndListing } = require("../middleware/validateIdAndListing");
const { isLoggedIn, isOwner } = require("../middleware/middleware");

//controllers :)
const listingController = require("../controllers/listing");

// Cloudinary upload config
const { storage } = require("../cloudConfig.js");

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file || !file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

const normalizeListingBody = (req, res, next) => {
  // Ensure body + listing object exist
  req.body = req.body || {};
  req.body.listing = req.body.listing || {};

  // Your EJS submits fields like: title, description, price...
  // So map them into req.body.listing.* for validateListing.
  req.body.listing.title =
    req.body.listing.title ?? req.body.title ?? req.body["listing[title]"];

  req.body.listing.description =
    req.body.listing.description ??
    req.body.description ??
    req.body["listing[description]"];

  req.body.listing.price =
    req.body.listing.price ?? req.body.price ?? req.body["listing[price]"];

  req.body.listing.location =
    req.body.listing.location ??
    req.body.location ??
    req.body["listing[location]"];

  req.body.listing.country =
    req.body.listing.country ??
    req.body.country ??
    req.body["listing[country]"];

  next();
};



router.route("/")
  .get(asyncHandler(listingController.index))//read
  .post(isLoggedIn,upload.single("image"),normalizeListingBody,validateListing,asyncHandler(listingController.create)); //create


// Listings - New get 
router.get("/new",isLoggedIn,listingController.new);

// Listings - Edit (form)
router.get("/:id/edit",isLoggedIn,isOwner,validateIdAndListing,asyncHandler(listingController.edit));

// Listings - Update
router.route("/:id")
.put(isLoggedIn,isOwner,upload.single("image"),normalizeListingBody,validateListing,asyncHandler(listingController.update))// Listings - Delete
.delete(isLoggedIn,isOwner,asyncHandler(listingController.delete))// Listings - Delete
.get(validateIdAndListing,asyncHandler(listingController.read)) //Listings - Read (details)


module.exports = router;
