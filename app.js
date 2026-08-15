/*********************************
 * Imports & App Setup
 *********************************/
//.env setup
if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const CloudDB = process.env.AtlasDB_URL || process.env.ATLASDB_URL;
const dbUrl = CloudDB || "mongodb://127.0.0.1:27017/wanderlust";
const sessionSecret = process.env.SESSION_SECRET || "changeMeToASecretInProduction";

// Utilities / Middleware
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const errorHandler = require("./middleware/errorHandler");

// Flash + session
const flash = require("connect-flash");
const session = require("express-session");
const { MongoStore } = require('connect-mongo');


// Passport auth
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user.js");

// Body Parsers & Static Assets (Mount Early)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const sessionStore = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: sessionSecret },
});

app.use(
  session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Flash
app.use(flash());

// Passport init
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();

if (googleClientId && googleClientSecret && !googleClientId.includes("your-google")) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/users/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`;
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = new User({
                username: (profile.displayName || "user").replace(/\s+/g, "_").toLowerCase() + "_" + Math.floor(Math.random() * 1000),
                email,
                googleId: profile.id,
              });
              await user.save();
            }
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash + passport data available in views
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || "";
  res.locals.error = req.flash("error") || "";
  res.locals.currentUser = req.user;
  res.locals.currentSearch = req.query.search || "";
  res.locals.currentFilter = req.query.filter || "";
  const fallbackMapboxToken = "pk.eyJ1IjoiYW1pdDEwIiwiYSI6ImNtcXc4N2xtMzA0YnYycnNhcTNobWtpd2sifQ.zi8SrM5yO-vSATWvs-ZMgw";
  res.locals.mapboxToken = process.env.MAP_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || fallbackMapboxToken;
  next();
});

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Serve static assets (CSS/JS/images)
app.use(express.static(path.join(__dirname, "/public")));

app.use("/listings", listingsRouter);
app.use("/listings", reviewsRouter);
app.use("/users", userRouter);
app.use("/bookings", bookingRouter);

/*********************************
 * DB Connection
 *********************************/
async function main() {
  mongoose.set("strictPopulate", false);
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => console.log("DB connection error:", err));

/*********************************
 * Routes
 *********************************/
app.get("/", (req, res) => {
  res.redirect("/listings/");
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
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

