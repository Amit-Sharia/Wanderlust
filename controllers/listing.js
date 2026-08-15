const path = require("path");
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const fallbackMapboxToken = "pk.eyJ1IjoiYW1pdDEwIiwiYSI6ImNtcXc4N2xtMzA0YnYycnNhcTNobWtpd2sifQ.zi8SrM5yO-vSATWvs-ZMgw";
const mapToken = process.env.MAP_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || fallbackMapboxToken;
const geoCodingClient = mbxGeoCoding({ accessToken: mapToken });

const geocodeLocation = async (locationText, countryText) => {
  if (!locationText || !mapToken) return null;
  const query = [locationText, countryText].filter(Boolean).join(", ");
  const geoResponse = await geoCodingClient
    .forwardGeocode({
      query,
      limit: 1,
      types: ["place", "locality", "region", "address", "postcode"],
      autocomplete: false,
    })
    .send();

  const feature = geoResponse?.body?.features?.[0];
  if (!feature || !Array.isArray(feature.center) || feature.center.length !== 2) {
    return null;
  }

  return {
    type: "Point",
    coordinates: feature.center,
  };
};

const buildImageData = (file) => {
  if (!file) return undefined;

  if (typeof file.path === "string" && file.path.startsWith("http")) {
    return { url: file.path, filename: file.filename || "listingimage" };
  }

  if (typeof file.path === "string") {
    const filename = file.filename || path.basename(file.path);
    return {
      url: `/uploads/${filename}`,
      filename,
    };
  }

  return undefined;
};

const buildImagesArray = (req) => {
  let images = [];
  if (Array.isArray(req.files) && req.files.length > 0) {
    images = req.files.map((file) => buildImageData(file)).filter(Boolean);
  } else if (req.file) {
    const img = buildImageData(req.file);
    if (img) images.push(img);
  }
  return images;
};

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeTextFilter = (keywords) => {
  const pattern = new RegExp(keywords.map(escapeRegExp).join("|"), "i");
  return {
    $or: [
      { title: pattern },
      { description: pattern },
      { location: pattern },
      { country: pattern },
    ],
  };
};

const filterDefinitions = {
  "trending": {
    sort: { createdAt: -1 },
  },
  "iconic-cities": {
    query: makeTextFilter([
      "city",
      "cities",
      "tokyo",
      "new york",
      "los angeles",
      "amsterdam",
      "dubai",
      "boston",
      "paris",
      "london",
      "barcelona",
    ]),
  },
  "mountain": {
    query: makeTextFilter([
      "mountain",
      "ski",
      "alpine",
      "chalet",
      "aspen",
      "banff",
      "tahoe",
      "highlands",
      "verbier",
      "hill",
    ]),
  },
  "beach": {
    query: makeTextFilter([
      "beach",
      "ocean",
      "sea",
      "shore",
      "island",
      "coast",
      "bali",
      "maldives",
      "phuket",
      "fiji",
      "cancun",
      "costa rica",
      "mykonos",
    ]),
  },
  "pools": {
    query: makeTextFilter([
      "pool",
      "swimming",
      "swim",
      "resort",
      "villa",
    ]),
  },
};

module.exports.index = async (req, res) => {
  const filterKey = String(req.query.filter || "").toLowerCase();
  const searchTerm = String(req.query.search || "").trim();
  const filter = filterDefinitions[filterKey] || {};
  const sort = filter.sort || { createdAt: -1 };

  const textSearch = searchTerm
    ? {
        $or: [
          { title: new RegExp(escapeRegExp(searchTerm), "i") },
          { description: new RegExp(escapeRegExp(searchTerm), "i") },
          { location: new RegExp(escapeRegExp(searchTerm), "i") },
          { country: new RegExp(escapeRegExp(searchTerm), "i") },
        ],
      }
    : null;

  let query;
  if (filter.query && textSearch) {
    query = { $and: [filter.query, textSearch] };
  } else if (filter.query) {
    query = filter.query;
  } else if (textSearch) {
    query = textSearch;
  } else {
    query = {};
  }

  const allListings = await Listing.find(query).sort(sort).limit(50);
  res.render("listings/index.ejs", {
    allListings,
    currentFilter: filterKey,
    currentSearch: searchTerm,
  });
};

module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.create = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    const uploadedImages = buildImagesArray(req);
    if (uploadedImages.length > 0) {
      newListing.images = uploadedImages;
      newListing.image = uploadedImages[0];
    }

    const geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
    if (geometry) {
      newListing.geometry = geometry;
    }

    await newListing.save();
    req.flash("success", "New stay listing created!");
    res.redirect("/listings");
  };

module.exports.edit=async (req, res) => {
    res.render("listings/edit.ejs", { listed: req.listed, mapboxToken: res.locals.mapboxToken });
  };

module.exports.update = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const updateData = { ...req.body.listing };
    const uploadedImages = buildImagesArray(req);
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
      updateData.image = uploadedImages[0];
    }

    const geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
    if (geometry) {
      updateData.geometry = geometry;
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true, new: true }
    );


    if (!updatedListing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }
    req.flash("success","listing Updated");
    res.redirect(`/listings/${id}`);
  }

module.exports.delete = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Resource not found (invalid id).",
      });
    }

    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }
    req.flash("success","listing deleted");
    res.redirect("/listings");
  }

module.exports.read =async (req, res) => {
    const { id } = req.params;

    // Always render using the Listing we fetched (ensures `listed` is present for show.ejs)
    const listing = await Listing.findById(id)
      .populate( {path :"reviews",
        populate :{
          path: "owner",
      }})
      .populate("owner");

    if (!listing) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Listing not found.",
      });
    }

    const hasValidGeometry =
      listing.geometry &&
      Array.isArray(listing.geometry.coordinates) &&
      listing.geometry.coordinates.length === 2 &&
      !(listing.geometry.coordinates[0] === 0 && listing.geometry.coordinates[1] === 0);

    if (!hasValidGeometry) {
      const geometry = await geocodeLocation(listing.location, listing.country);
      if (geometry) {
        listing.geometry = geometry;
        await listing.save();
      }
    }

    res.render("listings/show.ejs", { listed: listing, mapboxToken: res.locals.mapboxToken });
  }