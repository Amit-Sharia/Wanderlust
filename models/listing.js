const mongoose =require("mongoose");
const Schema =mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,

    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg"
        }
    },

    price: Number,
    location: String,
    country: String
});
const Listing =mongoose.model("Listing",listingSchema);
module.exports=Listing;
