const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js")
const upload=multer({storage});

// Index Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    
    upload.single('listing[image]'),
    
    validateListing,
    wrapAsync(listingController.createListing)
  );
  
  
  // new Route
  router.get("/new",isLoggedIn, listingController.renderNewForm);
  
  router
  .route("/:id")
  .get(wrapAsync(listingController.showForm))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateRoute)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteRoute));


  
  // Edit Route
  router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editRoute));
  

  module.exports=router