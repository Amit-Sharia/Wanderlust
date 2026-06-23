/*********************************
 * Imports & App Setup
 *********************************/
const express = require("express");
const app = express();

const mongoose = require("mongoose");

// (Models/validation handled inside routers)


// Utilities / Middleware
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const errorHandler = require("./middleware/errorHandler");

// Flash + session
const flash = require("connect-flash");
const session = require("express-session");
app.use(
  session({
    secret :"mysupersecret",
    resave:false,
    saveUninitialized:true,
  })
);

app.use(flash());


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");



/*********************************
 * DB Connection
 *********************************/
main()

  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

/*********************************
 * View engine + Middlewares
 *********************************/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error=req.flash("error");
  next();
});

app.engine("ejs", ejsMate);

// Serve static assets (CSS/JS/images)
app.use(express.static(path.join(__dirname, "/public")));

app.use("/listings", listingsRouter);
app.use("/listings", reviewsRouter);

/*********************************
 * Routes
 *********************************/


// Health check
app.get("/", (req, res) => {
  res.send("server is working");
});


app.use((req, res, next) => {
  res.locals.success = req.flash("success") || "";
  next();
});
// Listings routes are implemented in ./routes/listing.js


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




