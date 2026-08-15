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
      req.flash("success", `Welcome to Wanderlust, @${registeredUser.username}! Account created successfully.`);

      const redirectUrl = req.session?.redirectUrl || "/listings";
      if (req.session) req.session.redirectUrl = null;

      res.redirect(redirectUrl);
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

module.exports.checkUsername = async (req, res) => {
  try {
    const rawUsername = req.query.username;
    if (!rawUsername || typeof rawUsername !== "string") {
      return res.json({ available: false, message: "Username is required." });
    }
    const username = rawUsername.trim();
    if (username.length < 3) {
      return res.json({ available: false, message: "Username must be at least 3 characters long." });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({ available: false, message: "Only letters, numbers, and underscores are allowed." });
    }

    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${escapedUsername}$`, "i") } });
    if (existingUser) {
      return res.json({ available: false, message: `Username '@${username}' is already taken.` });
    }

    return res.json({ available: true, message: `Username '@${username}' is available!` });
  } catch (err) {
    return res.status(500).json({ available: false, message: "Error checking username." });
  }
};

module.exports.renderChooseUsername = (req, res) => {
  const pendingGoogle = req.session?.pendingGoogle;
  if (!pendingGoogle) {
    req.flash("error", "No pending Google sign-in session found.");
    return res.redirect("/users/login");
  }
  res.render("users/choose_username.ejs", {
    email: pendingGoogle.email,
    suggestedUsername: pendingGoogle.suggestedUsername || "user"
  });
};

module.exports.processChooseUsername = async (req, res, next) => {
  const pendingGoogle = req.session?.pendingGoogle;
  if (!pendingGoogle) {
    req.flash("error", "Session expired or invalid. Please sign in with Google again.");
    return res.redirect("/users/login");
  }

  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      req.flash("error", "Please enter a valid username.");
      return res.redirect("/users/google/choose-username");
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      req.flash("error", "Username must be at least 3 characters long.");
      return res.redirect("/users/google/choose-username");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      req.flash("error", "Username can only contain letters, numbers, and underscores.");
      return res.redirect("/users/google/choose-username");
    }

    const escapedUsername = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${escapedUsername}$`, "i") } });
    if (existingUser) {
      req.flash("error", `Username '@${cleanUsername}' is already taken. Please choose another.`);
      return res.redirect("/users/google/choose-username");
    }

    const user = new User({
      username: cleanUsername,
      email: pendingGoogle.email,
      googleId: pendingGoogle.googleId,
    });

    const randomSecret = Math.random().toString(36).slice(-10) + "Google1!";
    const registeredUser = await User.register(user, randomSecret);

    req.session.pendingGoogle = null;

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Wanderlust, @${registeredUser.username}! Your Google account setup is complete.`);
      const redirectUrl = req.session?.redirectUrl || "/listings";
      if (req.session) req.session.redirectUrl = null;
      res.redirect(redirectUrl);
    });
  } catch (err) {
    req.flash("error", "Failed to set username: " + err.message);
    res.redirect("/users/google/choose-username");
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

      req.flash("success", `Welcome back, @${user.username}!`);
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

module.exports.google_demo_login = async (req, res, next) => {
  try {
    let user = await User.findOne({ googleId: "demo_google_123456" });
    if (!user) {
      user = await User.findOne({ email: "google_demo@wanderlust.com" });
    }

    if (!user) {
      user = new User({
        username: "Google User",
        email: "google_demo@wanderlust.com",
        googleId: "demo_google_123456"
      });
      user = await User.register(user, "GoogleDemoSecretPass123!");
    }

    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Successfully signed in as Google User!");
      const redirectUrl = req.session?.redirectUrl || "/listings";
      if (req.session) req.session.redirectUrl = null;
      res.redirect(redirectUrl);
    });
  } catch (err) {
    req.flash("error", "Error with Google Sign-In: " + err.message);
    res.redirect("/users/login");
  }
};



