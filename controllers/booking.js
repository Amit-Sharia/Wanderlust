const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Message = require("../models/message");

// Create booking request
module.exports.create = async (req, res) => {
  const { listingId } = req.params;
  const { checkIn, checkOut, notes } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  if (listing.isBooked) {
    req.flash("error", "This stay is currently booked.");
    return res.redirect(`/listings/${listingId}`);
  }

  if (listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing.");
    return res.redirect(`/listings/${listingId}`);
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
    req.flash("error", "Invalid check-in and check-out dates.");
    return res.redirect(`/listings/${listingId}`);
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalPrice = (listing.price || 0) * days;

  const booking = new Booking({
    listing: listing._id,
    renter: req.user._id,
    owner: listing.owner,
    checkIn: startDate,
    checkOut: endDate,
    totalPrice,
    notes: notes || "",
    status: "pending",
  });

  await booking.save();
  req.flash("success", "Booking appointment request submitted to owner!");
  res.redirect("/bookings/dashboard");
};

// Dashboard: User's bookings & Owner's received requests
module.exports.dashboard = async (req, res) => {
  const myRequests = await Booking.find({ renter: req.user._id })
    .populate("listing")
    .populate("owner")
    .sort({ createdAt: -1 });

  const ownerRequests = await Booking.find({ owner: req.user._id })
    .populate("listing")
    .populate("renter")
    .sort({ createdAt: -1 });

  res.render("bookings/dashboard.ejs", { myRequests, ownerRequests });
};

// Owner approves booking request
module.exports.approve = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate("listing");

  if (!booking) {
    req.flash("error", "Booking request not found.");
    return res.redirect("/bookings/dashboard");
  }

  if (!booking.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized action.");
    return res.redirect("/bookings/dashboard");
  }

  booking.status = "approved";
  await booking.save();

  // Mark listing as booked
  await Listing.findByIdAndUpdate(booking.listing._id, { isBooked: true });

  req.flash("success", "Booking approved! The listing is now set to Booked mode and chat is unlocked.");
  res.redirect(`/bookings/${booking._id}/chat`);
};

// Owner rejects booking request
module.exports.reject = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);

  if (!booking || !booking.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized action.");
    return res.redirect("/bookings/dashboard");
  }

  booking.status = "rejected";
  await booking.save();

  req.flash("success", "Booking request rejected.");
  res.redirect("/bookings/dashboard");
};

// Cancel booking (Owner or Renter)
module.exports.cancel = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings/dashboard");
  }

  const isRenter = booking.renter.equals(req.user._id);
  const isOwner = booking.owner.equals(req.user._id);

  if (!isRenter && !isOwner) {
    req.flash("error", "Unauthorized action.");
    return res.redirect("/bookings/dashboard");
  }

  const wasApproved = booking.status === "approved";
  booking.status = "cancelled";
  await booking.save();

  if (wasApproved) {
    // Re-open listing if booking was previously approved
    await Listing.findByIdAndUpdate(booking.listing, { isBooked: false });
  }

  req.flash("success", "Booking has been cancelled and stay is available again.");
  res.redirect("/bookings/dashboard");
};

// Chat room for approved booking
module.exports.getChat = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate("listing")
    .populate("renter")
    .populate("owner");

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings/dashboard");
  }

  const isRenter = booking.renter._id.equals(req.user._id);
  const isOwner = booking.owner._id.equals(req.user._id);

  if (!isRenter && !isOwner) {
    req.flash("error", "You do not have access to this chat.");
    return res.redirect("/bookings/dashboard");
  }

  if (booking.status !== "approved") {
    req.flash("error", "Chat is only available for approved bookings.");
    return res.redirect("/bookings/dashboard");
  }

  const messages = await Message.find({ booking: booking._id })
    .populate("sender")
    .sort({ createdAt: 1 });

  res.render("bookings/chat.ejs", { booking, messages });
};

// JSON API endpoint for real-time messages polling
module.exports.getMessagesJson = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking || booking.status !== "approved") {
    return res.status(404).json({ success: false, message: "Chat unavailable." });
  }

  const isRenter = booking.renter.equals(req.user._id);
  const isOwner = booking.owner.equals(req.user._id);
  if (!isRenter && !isOwner) {
    return res.status(403).json({ success: false, message: "Unauthorized." });
  }

  const messages = await Message.find({ booking: booking._id })
    .populate("sender", "username")
    .sort({ createdAt: 1 });

  return res.json({ success: true, messages });
};

// Post a chat message
module.exports.postMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const booking = await Booking.findById(id);
  if (!booking || booking.status !== "approved") {
    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json")) || req.query.json === "true";
    if (isJson) return res.status(400).json({ success: false, message: "Chat unavailable." });
    req.flash("error", "Chat unavailable.");
    return res.redirect("/bookings/dashboard");
  }

  const isRenter = booking.renter.equals(req.user._id);
  const isOwner = booking.owner.equals(req.user._id);

  if (!isRenter && !isOwner) {
    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json")) || req.query.json === "true";
    if (isJson) return res.status(403).json({ success: false, message: "Unauthorized." });
    req.flash("error", "Unauthorized.");
    return res.redirect("/bookings/dashboard");
  }

  if (!text || !text.trim()) {
    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json")) || req.query.json === "true";
    if (isJson) return res.status(400).json({ success: false, message: "Message text cannot be empty." });
    return res.redirect(`/bookings/${id}/chat`);
  }

  const receiver = isRenter ? booking.owner : booking.renter;
  const message = new Message({
    booking: booking._id,
    sender: req.user._id,
    receiver,
    text: text.trim(),
  });

  await message.save();
  await message.populate("sender", "username");

  const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json")) || req.query.json === "true";
  if (isJson) {
    return res.json({ success: true, message });
  }

  res.redirect(`/bookings/${id}/chat`);
};
