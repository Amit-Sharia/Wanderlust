const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}
// remove the old data and add the new data from the data.js :)
const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
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
