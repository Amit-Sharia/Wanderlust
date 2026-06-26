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
            validate: {
                validator: function (v) {
                    // Allow empty/falsy if you want, otherwise remove this condition.
                    if (!v) return true;
                    try {
                        // eslint-disable-next-line no-new
                        new URL(v);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: (props) => `${props.value} is not a valid URL`,
            },
        },
    },

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
