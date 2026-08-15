const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const fallbackMapboxToken = "pk.eyJ1IjoiYW1pdDEwIiwiYSI6ImNtcXc4N2xtMzA0YnYycnNhcTNobWtpd2sifQ.zi8SrM5yO-vSATWvs-ZMgw";
const mapToken = process.env.MAP_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || fallbackMapboxToken;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

const geocodeLocation = async (location, country) => {
  if (!location) return null;
  const query = [location, country].filter(Boolean).join(", ");
  const response = await geocodingClient
    .forwardGeocode({
      query,
      limit: 1,
      types: ["place", "locality", "region", "address", "postcode"],
      autocomplete: false,
    })
    .send();

  const feature = response?.body?.features?.[0];
  if (!feature || !Array.isArray(feature.center) || feature.center.length !== 2) {
    return null;
  }

  return {
    type: "Point",
    coordinates: feature.center,
  };
};

const User = require("../models/user.js");

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Ensure a valid default seed user exists
  let seedUser = await User.findOne({ username: "wanderlust_demo" });
  if (!seedUser) {
    const demoUser = new User({ username: "wanderlust_demo", email: "demo@wanderlust.com" });
    seedUser = await User.register(demoUser, "DemoPass123!");
  }

  const seededListings = [];

  for (const obj of initData.data) {
    const geometry = await geocodeLocation(obj.location, obj.country);
    const listing = {
      ...obj,
      owner: seedUser._id,
      images: obj.image?.url ? [{ url: obj.image.url, filename: obj.image.filename || "listingimage" }] : [],
    };
    if (geometry) {
      listing.geometry = geometry;
    }
    seededListings.push(listing);
  }

  await Listing.insertMany(seededListings);
  console.log("Database seeded successfully with valid owner ID!");
};


main()
  .then(() => {
    console.log("connected to DB");
    return initDB();
  })
  .then(() => {
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });
