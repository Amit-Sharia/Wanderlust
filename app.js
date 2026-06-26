/*********************************
 * Imports & App Setup
 *********************************/
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Utilities / Middleware
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const errorHandler = require("./middleware/errorHandler");

// Flash + session
const flash = require("connect-flash");
const session = require("express-session");

// Passport auth
const passport = require("passport");
const User = require("./models/user.js");

// Sessions
app.use(
  session({
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Flash
app.use(flash());

// Passport init
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash + passport data available in views
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || "";
  res.locals.error = req.flash("error") || "";
  res.locals.currentUser = req.user;
  next();
});

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Serve static assets (CSS/JS/images)
app.use(express.static(path.join(__dirname, "/public")));

app.use("/listings", listingsRouter);
app.use("/listings", reviewsRouter);
app.use("/users", userRouter);

/*********************************
 * DB Connection
 *********************************/
async function main() {
  // Disable strict populate (prevents errors when populate paths don’t match schema exactly)
  mongoose.set("strictPopulate", false);
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.log(err));
/*********************************
 * Routes
 *********************************/
app.get("/", (req, res) => {
  res.send("server is working");
});

// Fallback for navbar link without trailing slash
app.get("/listings", (req, res) => {
  res.redirect("/listings/");
});

/*********************************
 * 404 + Error handler
 *********************************/
app.use((req, res) => {
  res.status(404).render("error", {
    statusCode: 404,
    message: "Page not found.",
  });
});

app.use(errorHandler);

/*********************************
 * Server
 *********************************/
app.listen(8080, () => {
  console.log("server is listining to port 8080");
});

