const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { isLoggedIn } = require("../middleware/middleware");
const bookingController = require("../controllers/booking");

// Dashboard: My Bookings & Incoming Requests
router.get("/dashboard", isLoggedIn, asyncHandler(bookingController.dashboard));

// Create booking request for listing
router.post("/request/:listingId", isLoggedIn, asyncHandler(bookingController.create));

// Owner actions
router.patch("/:id/approve", isLoggedIn, asyncHandler(bookingController.approve));
router.patch("/:id/reject", isLoggedIn, asyncHandler(bookingController.reject));
router.patch("/:id/cancel", isLoggedIn, asyncHandler(bookingController.cancel));

// Chat endpoints
router.get("/:id/chat", isLoggedIn, asyncHandler(bookingController.getChat));
router.post("/:id/chat", isLoggedIn, asyncHandler(bookingController.postMessage));

module.exports = router;
