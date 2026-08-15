# Comprehensive Technical Documentation: Wanderlust Platform

Welcome to the complete architectural and development documentation for **Wanderlust** — a full-stack vacation rental listing, booking appointment, and messaging platform built with **Node.js**, **Express**, **MongoDB**, **EJS**, **Bootstrap 5**, **Mapbox GL JS**, and **Cloudinary**.

This document covers **every single component, schema, route, controller, middleware, UI component, and utility** in detail, followed by a step-by-step rebuilding guide so you can recreate this exact application from scratch.

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Directory Tree & File Structure](#2-directory-tree--file-structure)
3. [Environment Variables (`.env`)](#3-environment-variables-env)
4. [Dependencies (`package.json`)](#4-dependencies-packagejson)
5. [Database Models & Schemas](#5-database-models--schemas)
6. [Authentication & Authorization Flow](#6-authentication--authorization-flow)
7. [Routes & Controllers Breakdown](#7-routes--controllers-breakdown)
8. [Real-time AJAX Chat Engine](#8-real-time-ajax-chat-engine)
9. [Front-End Design System & EJS Views](#9-front-end-design-system--ejs-views)
10. [Database Seeding (`init/`)](#10-database-seeding-init)
11. [Step-by-Step Guide to Rebuild from Scratch](#11-step-by-step-guide-to-rebuild-from-scratch)

---

## 1. Project Overview & Architecture

Wanderlust follows the **MVC (Model-View-Controller)** pattern:

- **Models**: Mongoose schemas for `Listing`, `User`, `Review`, `Booking`, and `Message`.
- **Views**: Server-side rendered EJS templates using `ejs-mate` layouts, styled with a modern **Red & White** visual identity (`#fe424d` brand primary, soft rose `#fff1f2` backgrounds, custom Bootstrap 5 extensions).
- **Controllers**: Decoupled handlers executing business logic, geocoding, file uploading, and authentication.
- **Routes**: RESTful Express routers for `/listings`, `/listings/:id/reviews`, `/users`, and `/bookings`.

### Core Features
1. **Stay Management (CRUD)**: Create, view, edit, search, filter (trending, iconic cities, mountains, beaches, pools), and delete stays.
2. **Interactive Mapbox Integration**: Automatic forward geocoding on listing creation and interactive Mapbox maps on stay detail pages.
3. **Cloudinary Multi-Image Upload**: Support for multi-photo carousels per listing using `multer-storage-cloudinary`.
4. **Booking Appointment System**: Renter sends check-in/check-out appointment request -> Host accepts or rejects -> Stay switches status to `BOOKED`.
5. **Real-time AJAX Chat**: Approved bookings unlock a live chat room between Host and Guest with 2-second background polling for instant message delivery without page reloads.
6. **Dual Authentication System**: Passport Local (username + password + SVG CAPTCHA challenge) + Passport Google OAuth 2.0.
7. **Reviews & Ratings**: Guest review submission with 1-5 star visualization (`starability`) and user deletion controls.

---

## 2. Directory Tree & File Structure

```
Major_Project/
├── .env                          # Environment variables (secrets, DB URL, API keys)
├── .gitignore                    # Git ignore file
├── app.js                        # Main Express application entrypoint
├── cloudConfig.js                # Cloudinary storage configuration
├── package.json                  # NPM manifest and scripts
├── controllers/                  # Business logic handlers
│   ├── booking.js                # Booking requests, approval, cancellation & chat
│   ├── listing.js                # Listing CRUD, search, filter, Mapbox geocoding
│   ├── reviews.js                # Review creation & deletion
│   └── user.js                   # Authentication, captcha, Google OAuth handlers
├── init/                         # Database initialization & sample data
│   ├── data.js                   # Array of initial sample stay listings
│   └── index.js                  # Database seed script
├── middleware/                   # Express custom middlewares
│   ├── errorHandler.js           # Global error handling middleware
│   ├── middleware.js             # Authentication & authorization checks (isLoggedIn, isOwner, etc.)
│   ├── validateIdAndListing.js   # ObjectId format validation
│   ├── validateListing.js        # Joi schema validation for listing input
│   └── validateReview.js         # Joi schema validation for review input
├── models/                       # Mongoose database models
│   ├── booking.js                # Booking schema
│   ├── listing.js                # Listing schema (with post-delete review cleanup hook)
│   ├── message.js                # Chat message schema
│   ├── review.js                 # Review schema
│   └── user.js                   # User schema (passport-local-mongoose)
├── public/                       # Static public assets
│   ├── css/
│   │   ├── rating.css            # Starability rating radio button styles
│   │   └── style.css             # Main application design system & Red-White theme
│   ├── js/
│   │   ├── map.js                # Mapbox GL JS frontend client initialization
│   │   └── script.js             # Form validation & page loader handling
│   └── uploads/                  # Local fallback uploads directory
├── routes/                       # Express router modules
│   ├── booking.js                # /bookings routes
│   ├── listing.js                # /listings routes
│   ├── reviews.js                # /listings/:id/reviews routes
│   └── user.js                   # /users authentication routes
├── utils/                        # Utility helper functions
│   ├── asyncHandler.js           # Wrapper for async route error catching
│   ├── captcha.js                # SVG CAPTCHA generator
│   └── httpErrors.js             # ExpressError custom error class
├── validation/                   # Joi validation schemas
│   ├── listingSchema.js          # Joi schema for listings
│   └── reviewSchema.js           # Joi schema for reviews
└── views/                        # EJS template views
    ├── error.ejs                 # Error alert page (404 / 500)
    ├── bookings/
    │   ├── chat.ejs              # Clean Red & White live chat screen
    │   └── dashboard.ejs         # User dashboard (Outgoing & Incoming stay requests)
    ├── includes/
    │   ├── flash.ejs             # Flash success/error banner component
    │   ├── footer.ejs            # Global footer component
    │   └── navbar.ejs            # Sticky navbar with search pill & user menu
    ├── layouts/
    │   └── boilerplate.ejs       # Main EJS-Mate layout wrapper
    ├── listings/
    │   ├── edit.ejs              # Edit stay form
    │   ├── index.ejs             # Home feed, filter pills, tax toggle, listing grid
    │   ├── new.ejs               # Create new stay form (multi-image upload)
    │   ├── review.ejs            # Standalone review form page
    │   └── show.ejs              # Stay detail page (Carousel, Booking Card, Reviews, Map)
    └── users/
        ├── choose_username.ejs   # Handle selection screen for Google OAuth new users
        ├── login.ejs             # Login page with CAPTCHA
        └── register.ejs          # Registration page
```

---

## 3. Environment Variables (`.env`)

Create a `.env` file in the root folder with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Connection (MongoDB Atlas or Local MongoDB)
AtlasDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/wanderlust?retryWrites=true&w=majority
SESSION_SECRET=supersecretwanderlustsessionkey

# Cloudinary Setup (For listing image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Mapbox Access Token (For geocoding & interactive maps)
MAP_TOKEN=pk.eyJ1IjoieW91ciIsImEiOiJ5b3VyX3Rva2VuIn0.example

# Google OAuth 2.0 (Optional - for Google Sign-in)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/users/auth/google/callback
```

---

## 4. Dependencies (`package.json`)

Here is the exact `package.json` setup required:

```json
{
  "name": "major_project",
  "version": "1.0.0",
  "description": "Wanderlust Vacation Rental & Booking Platform",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "@mapbox/mapbox-sdk": "^0.16.2",
    "cloudinary": "^1.41.3",
    "connect-flash": "^0.1.1",
    "connect-mongo": "^6.0.0",
    "dotenv": "^17.4.2",
    "ejs": "^6.0.1",
    "ejs-mate": "^4.0.0",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "joi": "^18.2.3",
    "method-override": "^3.0.0",
    "mongoose": "^9.7.0",
    "multer": "^2.2.0",
    "multer-storage-cloudinary": "^4.0.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^9.1.0"
  }
}
```

---

## 5. Database Models & Schemas

### 1. User Model (`models/user.js`)
Handles standard authentication via `passport-local-mongoose` and stores Google OAuth identifiers.

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
  },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
```

### 2. Listing Model (`models/listing.js`)
Stores listing information, GeoJSON coordinates, images, owner, and reviews. Contains a post Mongoose hook to automatically delete associated reviews when a listing is deleted.

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const imageSchema = new Schema({
  filename: String,
  url: String,
});

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: imageSchema,          // Legacy single image support
  images: [imageSchema],       // Multi-photo array
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: ["trending", "iconic-cities", "mountain", "beach", "pools", "rooms", "farms", "arctic", "camping"],
    default: "trending",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  isBooked: { type: Boolean, default: false },
});

// Cascade cleanup hook
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
```

### 3. Review Model (`models/review.js`)
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Review", reviewSchema);
```

### 4. Booking Model (`models/booking.js`)
Tracks guest stay appointment requests and status.

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  renter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
```

### 5. Message Model (`models/message.js`)
Stores chat messages exchanged between Host and Guest for an approved booking.

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
```

---

## 6. Authentication & Authorization Flow

Authentication is managed in `app.js` and `controllers/user.js`:

1. **Passport Local Strategy**: Authenticates username and password against hash/salt stored by `passport-local-mongoose`.
2. **SVG Security Verification**:
   - `utils/captcha.js` generates a math problem (e.g., `5 + 3 = ?`) rendered as an inline SVG string.
   - The correct numeric answer is saved in `req.session.captchaAnswer`.
   - On submission, `controllers/user.js` verifies the user input against `req.session.captchaAnswer`.
3. **Google OAuth 2.0**:
   - If a Google account email already exists, it links `googleId`.
   - If a new Google user attempts sign-in, Passport redirects them to `/users/choose-username` to pick a custom handle before completing account creation.
4. **Middleware Protection (`middleware/middleware.js`)**:
   - `isLoggedIn`: Verifies user is authenticated before allowing posting reviews, booking requests, or access to chat rooms. Saves return URL in `req.session.redirectUrl`.
   - `isOwner`: Verifies `req.user._id` matches `listing.owner._id` before editing/deleting stays.
   - `isReviewAuthor`: Verifies `req.user._id` matches `review.owner._id` before deleting reviews.
   - `isBookingParticipant`: Ensures only the renter or owner of a booking can access its chat room.

---

## 7. Routes & Controllers Breakdown

### 1. Listing Controller (`controllers/listing.js`)
- **`index`**: Fetches stays filtered by search keyword or category pill (e.g. `trending`, `mountain`, `beach`).
- **`renderNewForm`**: Renders `listings/new.ejs`.
- **`createListing`**: Uses `@mapbox/mapbox-sdk/services/geocoding` to convert location text into `Point` coordinates `[long, lat]`. Uploads photos to Cloudinary using `multer`.
- **`showListing`**: Populates `owner`, `reviews`, and review `owner`s.
- **`renderEditForm`**: Generates resized Cloudinary preview thumbnail (`/upload/w_250`) for edit view.
- **`updateListing`**: Updates details, re-geocodes location if updated, and appends new images.
- **`destroyListing`**: Triggers cascade review deletion and removes stay.

### 2. Booking Controller (`controllers/booking.js`)
- **`createRequest`**: Calculates total stay cost based on nights `(checkOut - checkIn) * listing.price` and creates `Booking` in `pending` state.
- **`renderDashboard`**: Fetches all `myRequests` (renter) and `ownerRequests` (host).
- **`approveBooking`**: Sets booking status to `approved` and sets `listing.isBooked = true`.
- **`rejectBooking`**: Sets booking status to `rejected`.
- **`cancelBooking`**: Sets booking status to `cancelled` and frees the listing (`isBooked = false`).
- **`renderChat`**: Renders Red & White chat UI (`views/bookings/chat.ejs`).
- **`sendMessage`**: Accepts message via POST request. Returns JSON if `json=true` query flag is provided for smooth single-page updates.
- **`getMessagesJson`**: Returns JSON payload `{ success: true, messages: [...] }` for background polling.

---

## 8. Real-time AJAX Chat Engine

The chat system operates without complex WebSocket server overhead:

1. **Message Submission**:
   - `chat.ejs` attaches an `async form.submit` event listener.
   - Posts data to `/bookings/:id/chat?json=true`.
   - On HTTP 200 response, it immediately appends the bubble to `#messagesContainer` without refreshing the web page.

2. **Real-time Polling**:
   - `setInterval(pollMessages, 2000)` polls `/bookings/:id/messages/json` every 2 seconds.
   - The client tracks message IDs in a `Set()`.
   - New incoming messages from the other user are seamlessly appended to the chat box and auto-scrolled to the bottom.

---

## 9. Front-End Design System & EJS Views

### Visual Identity
- **Primary Red Tone**: `#fe424d` (Hover `#e0323c`)
- **Secondary Red Tone**: `#e11d48`
- **Soft Tint Backgrounds**: `#fff1f2`
- **Borders**: `#fecdd3`

### Key EJS Templates
- `views/layouts/boilerplate.ejs`: EJS-mate root template containing `<head>`, Bootstrap 5 CSS/JS, FontAwesome 6, Mapbox GL JS, navbar, flash messages, container, footer, and a blur loading overlay.
- `views/includes/navbar.ejs`: Sticky navigation bar with brand icon, search pill bar, Explore/Add Stay links, Bookings & Chats link, and user avatar dropdown menu.
- `views/listings/index.ejs`: Displays filter pills (All Stays, Trending, Cities, Mountain, Beach, Pools), tax toggle switch (`Display total before & after tax` adds 18% GST), and listing grid.
- `views/bookings/dashboard.ejs`: Dual-tab interface using custom red `.nav-pills` for Outgoing Stay Requests and Incoming Stay Requests.
- `views/bookings/chat.ejs`: Clean Red & White chat card with smooth rose background, red right-aligned bubbles for sent messages, and white left-aligned bubbles for received messages.

---

## 10. Database Seeding (`init/`)

To populate your database with initial sample stays:

1. Edit `init/index.js` to assign a valid `owner` ObjectId from your database.
2. Execute the script in terminal:
   ```bash
   node init/index.js
   ```
3. The script deletes existing listings, geocodes each sample stay using Mapbox, assigns default category values, and saves them to MongoDB.

---

## 11. Step-by-Step Guide to Rebuild from Scratch

Follow these step-by-step instructions to recreate this exact project from zero:

### Step 1: Initialize Workspace & Install Dependencies
```bash
mkdir Wanderlust
cd Wanderlust
npm init -y
npm install express mongoose ejs ejs-mate dotenv method-override connect-flash express-session connect-mongo passport passport-local passport-local-mongoose passport-google-oauth20 multer multer-storage-cloudinary cloudinary @mapbox/mapbox-sdk joi
```

### Step 2: Create Directory Structure
```bash
mkdir controllers models routes views views/layouts views/includes views/listings views/users views/bookings public public/css public/js utils validation middleware init
```

### Step 3: Create Environment Configuration (`.env`)
Create `.env` with your MongoDB connection URI, Cloudinary keys, and Mapbox Access Token.

### Step 4: Setup Cloud Storage (`cloudConfig.js`)
Configure `cloudinary` v2 and `CloudinaryStorage` from `multer-storage-cloudinary` targeting folder `'wanderlust_DEV'`.

### Step 5: Define Mongoose Schemas (`models/`)
Create `user.js`, `listing.js`, `review.js`, `booking.js`, and `message.js` as detailed in [Section 5](#5-database-models--schemas).

### Step 6: Create Utilities & Middlewares (`middleware/`, `utils/`)
- Write `asyncHandler.js` and `httpErrors.js`.
- Create `captcha.js` using `svg-captcha` logic or basic math SVG string generator.
- Implement `middleware/middleware.js` with `isLoggedIn`, `isOwner`, `isReviewAuthor`, `isBookingParticipant`.

### Step 7: Create Controllers & Routers (`controllers/`, `routes/`)
- Implement listing CRUD, search filtering, and Mapbox geocoding in `controllers/listing.js`.
- Implement booking requests, status toggling (`approved`/`rejected`/`cancelled`), and chat JSON polling in `controllers/booking.js`.
- Wire routers in `routes/listing.js`, `routes/user.js`, `routes/reviews.js`, `routes/booking.js`.

### Step 8: Build Views & CSS System (`views/`, `public/`)
- Create `public/css/style.css` with red brand variables and custom button hover overrides.
- Create `views/layouts/boilerplate.ejs` with Bootstrap 5 and FontAwesome.
- Create `views/listings/index.ejs`, `views/listings/show.ejs`, `views/bookings/dashboard.ejs`, and `views/bookings/chat.ejs`.

### Step 9: Main Entrypoint (`app.js`)
Connect Express, Mongoose, Session Store, Passport strategies, Flash, Routers, static assets, 404 handler, and global error handling middleware.

### Step 10: Run & Verify
```bash
node init/index.js
node app.js
```
Open your browser at `http://localhost:8080` to explore your fully functioning vacation rental platform!

---
*Documentation compiled and maintained for Wanderlust Major Project.*
