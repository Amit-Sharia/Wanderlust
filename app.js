const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const path =require("path");
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");
const asyncHandler = require("./utils/asyncHandler");
const errorHandler = require("./middleware/errorHandler");
const { validateListing } = require("./middleware/validateListing");
const { validateIdAndListing } = require("./middleware/validateIdAndListing");




main().then(()=>{
    console.log("db connected");
}
    

)
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("server is working");
})

// app.get("/testListing" ,async (req,res)=>{
//         let sampleListing = new Listing({
//             title : "My New Villa",
//             description : "By the beach",
//             price:1200,
//             location: "Calangute",
//             country :"India"
//         });
//         await sampleListing.save();
//         console.log("sample was saved ");
//         res.send("successful testing");
// });

app.get("/listings", asyncHandler(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));


app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});



app.post("/listings", validateListing, asyncHandler(async (req, res) => {
    const newListing = new Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
}));


app.get("/listings/:id/edit", validateIdAndListing, asyncHandler(async (req, res) => {
    res.render("listings/edit.ejs", { listed: req.listed });
}));



app.put("/listings/:id", validateListing, asyncHandler(async (req, res) => {
    let { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).render("error", { statusCode: 404, message: "Resource not found (invalid id)." });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true, new: true }
    );

    if (!updatedListing) {
        return res.status(404).render("error", { statusCode: 404, message: "Listing not found." });
    }

    res.redirect(`/listings/${id}`);
}));


app.delete("/listings/:id", asyncHandler(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).render("error", { statusCode: 404, message: "Resource not found (invalid id)." });
    }

    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
        return res.status(404).render("error", { statusCode: 404, message: "Listing not found." });
    }

    res.redirect("/listings");
}));

app.get("/listings/:id", validateIdAndListing, asyncHandler(async (req, res) => {
    res.render("listings/show.ejs", { listed: req.listed });
}));

// 404 handler for any unknown route
app.use((req, res) => {
    res.status(404).render("error", {
        statusCode: 404,
        message: "Page not found.",
    });
});





app.use(errorHandler);

app.listen(8080, () => {
    console.log("server is listining to port 8080");
});



