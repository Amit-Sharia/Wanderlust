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
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash("error", "Google Sign-In is not configured yet. Please use username & password login.");
    return res.redirect("/users/login");
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/auth/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash("error", "Google Sign-In is not configured.");
    return res.redirect("/users/login");
  }
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

