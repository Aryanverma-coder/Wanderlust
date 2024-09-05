if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

//console.log(process.env.CLOUD_NAME);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require("path");
const session=require("express-session");
const bodyParser=require("body-parser");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const flash=require("connect-flash");


const ExpressError1 = require("./utils/ExpressError1.js");
app.use(express.static(path.join(__dirname, 'public')));
const {listingSchema}=require("./schema.js");
//router
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");




//session
const sessionOptions={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie: {
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
  },
};


const mongo_url="mongodb://127.0.0.1:27017/wonderlust";




main()
  .then(()=>{
    console.log("connect to db");
  })
  .catch((err)=>{
    console.log(err);
  });
async function main(){
     await mongoose.connect(mongo_url);
}
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsMate);
// app.locals.layout = 'layouts/boilerplate';

app.use(methodOverride("_method"));
//home route
app.get("/",(req,res)=>{
  res.send("hey!i am home");
})

//

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  //console.log(res.locals.success);
  next();
})

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"apnacollege",
//   });
//   let regUser=await User.register(fakeUser,"helloworld");
//   res.send(regUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);




// app.get("/testListing",async(req,res)=>{
//   let sampleListing=new Listing({
//     title:"My new Villa",
//     description : "By the beach",
//     price:1200,
//     location:"Calangute, Goa",
//     country:"India",

//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("sucessful testing");
// });

app.all("*",(req,res,next)=>{
  next(new ExpressError1(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
  let{statusCode=500,message="Something went wrong!"}=err;
  res.status(statusCode).render("error.ejs",{message});
})

app.listen(8080,()=>{
    console.log("port is listening on 8080");
});