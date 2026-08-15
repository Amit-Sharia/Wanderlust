const User = require("../models/user");
const passport = require("passport");
const { generateCaptcha } = require("../utils/captcha");


module.exports.register_get = (req, res) => {
  const captcha = generateCaptcha();
  req.session.captchaAnswer = captcha.answer;
  res.render("users/register.ejs", { captchaSvg: captcha.svg });
};

module.exports.register_post = async (req, res, next) => {
  try {
    const { username, email, password, captcha } = req.body;

    if (!captcha || captcha.trim() !== String(req.session.captchaAnswer)) {
      req.flash("error", "Incorrect Captcha answer. Please try again.");
      return res.redirect("/users/register");
    }

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
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

module.exports.login_get = (req, res) => {
  const captcha = generateCaptcha();
  req.session.captchaAnswer = captcha.answer;
  res.render("users/login.ejs", { captchaSvg: captcha.svg });
};

module.exports.login_post = (req, res, next) => {
  const { captcha } = req.body;

  if (!captcha || captcha.trim() !== String(req.session.captchaAnswer)) {
    req.flash("error", "Incorrect Captcha answer. Please try again.");
    return res.redirect("/users/login");
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", info?.message || "Invalid username or password.");
      return res.redirect("/users/login");
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      req.flash("success", "Logged in successfully.");
      const redirectUrl = req.session?.redirectUrl || "/listings";
      if (req.session) req.session.redirectUrl = null;
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out.");
    res.redirect("/listings");
  });
};

