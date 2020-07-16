const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/**
 * insert isAuth as arguments to any routes that need to be logged in to be accessed
 * disable isAuth when debugging other features
 * **/

router.post('/signup', authController.signup);
/**
 * req : {
 *     name, password, email
 * }
 * res: {
 *      message:"User created", userId, name
 * }
 * **/

router.post('/login',authController.login);
/**
 * req:{
 *     name, password
 * }
 * res:{
 *     token, userId, room
 * }
 * **/


router.post('/createRoom', authController.createRoom);
/**
 "user1":user1,
 "user2":user2
 **/

module.exports = router;