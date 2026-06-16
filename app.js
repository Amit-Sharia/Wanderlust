const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const path =require("path");
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");

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

app.get("/listings",async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})


app.post("/listings",async (req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

app.get("/listings/:id/edit",async (req,res)=>{
    let {id} =req.params;
    const listed=await Listing.findById(id);
    res.render("listings/edit.ejs",{listed});
})

app.put("/listings/:id",async (req,res)=>{
    let {id} =req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing}); // spread operator it spread them out as key vals pair and changes by that fn
    res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id",async (req,res)=>{
    let {id} =req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})



app.get("/listings/:id",async (req,res)=>{
    let {id} =req.params;
    const listed=await Listing.findById(id);
    res.render("listings/show.ejs",{listed});
})



app.listen(8080,()=>{
    console.log("server is listining to port 8080");
})

