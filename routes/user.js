const express = require("express");
const router = express.Router();

const passport = require("passport");

const User = require("../models/user");

// ============
// Register
// ============
router.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

router.post(
  "/register",
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // passport-local-mongoose expects: username + password by default.
      // If your form doesn't send username, update it to send username.
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");

        const redirectUrl = req.session?.redirectUrl || "/listings";
        if (req.session) req.session.redirectUrl = null;

        res.redirect(redirectUrl);
      });
    } catch (err) {
        req.flash("error",err.message);
        res.redirect("/users/register");
    }
  }
);

// ============
// Login
// ============
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", { //middleware for authentication
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in successfully.");
    res.redirect("/listings");
  }
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out.");
    res.redirect("/listings");
  });
});

module.exports = router;
