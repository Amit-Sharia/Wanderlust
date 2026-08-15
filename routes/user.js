const express = require("express");
const router = express.Router();

const passport = require("passport");

const User = require("../models/user");

const userController=require("../controllers/user");

// Register
router.route("/register")
.get(userController.register_get)
.post(userController.register_post);

// Login
router.route("/login")
.get(userController.login_get)
.post(userController.login_post);

// Google OAuth
router.get("/auth/google", (req, res, next) => {
  const gId = process.env.GOOGLE_CLIENT_ID;
  const gSec = process.env.GOOGLE_CLIENT_SECRET;
  if (!gId || !gSec || gId.includes("your-google") || gSec.includes("your-google")) {
    req.flash("error", "Google Client ID & Secret must be set in .env or Render Environment tab.");
    return res.redirect("/users/login");
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/users/login", failureFlash: true })(req, res, () => {
    req.flash("success", "Successfully logged in with Google!");
    const redirectUrl = req.session?.redirectUrl || "/listings";
    if (req.session) req.session.redirectUrl = null;
    res.redirect(redirectUrl);
  });
});




// Logout
router.post("/logout", userController.logout);

module.exports = router;

