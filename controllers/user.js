const User = require("../models/user");
const passport = require("passport");

module.exports.register_get = (req, res) => {
  res.render("users/register.ejs");
};

module.exports.register_post =async (req, res, next) => {
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
  };


module.exports.login_get =  (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login_post = passport.authenticate("local", { //middleware for authentication
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in successfully.");
    res.redirect("/listings");
  };

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out.");
    res.redirect("/listings");
  });
};
