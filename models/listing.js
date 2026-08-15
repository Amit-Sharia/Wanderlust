const mongoose =require("mongoose");
const Schema =mongoose.Schema;
const Review =require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },

    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default:
                "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
        },
    },
    images: [
        {
            filename: { type: String, default: "listingimage" },
            url: { type: String, required: true },
        },
    ],

    price: {
        type: Number,
        min: [0, "Price must be >= 0"],
    },
    location: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

}, { timestamps: true });


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && Array.isArray(listing.reviews) && listing.reviews.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing =mongoose.model("Listing",listingSchema);
module.exports=Listing;
