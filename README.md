# Wanderlust

A travel listing web application built with Node.js, Express, MongoDB, Passport authentication, and EJS templates. Users can browse travel listings, register and log in, add reviews, and manage listings with a modern UI and flash message feedback.

**GitHub description:** A simple travel marketplace prototype with user auth, listings, reviews, and session-backed flash notifications.

## Features

- User registration, login, and logout with Passport.js
- Flash notifications for success/error messages
- MongoDB database connection via Mongoose
- Session storage in MongoDB with `connect-mongo`
- Listing creation, editing, viewing, and deletion
- Review creation and deletion for listings
- EJS view templates with Bootstrap styling
- Support for Mapbox token integration and image uploading
- Production-ready server port fallback and proxy support

> **Work in progress:** This project is an early-stage prototype. The core travel listing features are working, but the UI is not fully complete, responsive design still needs improvement, and advanced user flows like history, buying/selling, and full account features are not yet implemented.

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- Passport.js + passport-local-mongoose
- express-session + connect-mongo
- EJS + ejs-mate
- Bootstrap 5
- Cloudinary support for image uploads (optional)
- Mapbox for map rendering

## Project Structure

- `app.js` - application entry point and middleware setup
- `routes/` - route definitions for listings, reviews, and users
- `controllers/` - request handlers and authentication logic
- `models/` - Mongoose schemas for `Listing`, `Review`, and `User`
- `views/` - EJS templates for pages and layout
- `public/` - static assets including CSS and client-side JS
- `init/data.js` - sample listing data
- `middleware/` - auth checks and custom error handling
- `cloudConfig.js` - Cloudinary and upload configuration

## Environment Variables

Create a `.env` file with the following values:

```env
NODE_ENV=development
PORT=8080
SESSION_SECRET=your-session-secret
AtlasDB_URL=your-mongodb-connection-string
MAP_TOKEN=your-mapbox-access-token
CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret
```

> For a production deployment, `NODE_ENV=production` should be used and `SESSION_COOKIE_SECURE` can be set to `true` when behind HTTPS.

## Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   node app.js
   ```

3. Open a browser and go to:

   ```
   http://localhost:8080
   ```

## Deployment Notes

This app is ready to deploy on Node hosting platforms such as Render, Heroku, or Vercel. Key deployment considerations:

- Use `process.env.PORT` so the host can assign the correct port.
- Provide a MongoDB connection string via `AtlasDB_URL`.
- Set `SESSION_SECRET` to a secure value.
- If using Cloudinary, configure `CLOUD_NAME`, `API_KEY`, and `API_SECRET`.
- If using Mapbox, set `MAP_TOKEN`.

## How the App Works

- `app.js` connects to the database, configures sessions, flash messages, and Passport authentication.
- Flash messages are rendered in `views/includes/flash.ejs` and displayed on every page via the layout.
- Protected routes require login and redirect unauthorized users to `/users/login`.
- Registration and login forms are in `views/users/register.ejs` and `views/users/login.ejs`.

## Deployment Success

When deployed successfully, the server logs:

- `db connected`
- `server is listening on port <PORT>`

If you use Render, the build process installs dependencies and runs `node app.js`. Ensure your environment variables are configured in the Render dashboard.

## Future Improvements

- Add listing image upload and storage integration
- Add search and filter support for listings
- Add user profile pages and saved favorites
- Add stronger validation and error handling

---

Built with passion for travel and modern web development. Enjoy exploring Wanderlust!
