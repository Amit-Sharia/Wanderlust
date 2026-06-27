const express = require("express");
const router = express.Router();

const passport = require("passport");

const User = require("../models/user");

const userController=require("../controllers/user");

// Register
router.route("/register")
.get(userController.register_get)
.post(userController.register_post);

// Login
router.route("/login")
.get(userController.login_get)
.post(userController.login_post);


//logout
router.post("/logout",userController.logout);

module.exports = router;
