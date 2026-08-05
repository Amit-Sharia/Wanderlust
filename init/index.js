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

async function main() {
  await mongoose.connect(MONGO_URL);
}
// remove the old data and add the new data from the data.js :)
const initDB = async () => {
  await Listing.deleteMany({});
  const seededListings = [];

  for (const obj of initData.data) {
    const geometry = await geocodeLocation(obj.location, obj.country);
    const listing = {
      ...obj,
      owner: "6a3c21e86015cbd7e8f2a876",
    };
    if (geometry) {
      listing.geometry = geometry;
    }
    seededListings.push(listing);
  }

  await Listing.insertMany(seededListings);
  console.log("data was initialized");
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
