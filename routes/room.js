const express = require('express');

const roomController = require('../controllers/room');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/**
 * insert isAuth as arguments to any routes that need to be logged in to be accessed
 * disable isAuth when debugging other features
 * **/

router.post('/createEvent', roomController.createEvent);
/**
 * req:{
 *     room, content, date
 * }
 * res:{
 *     message:"Event created"
 * }
 *
 * **/

router.get('/getEvents', roomController.getEvents);
/**
 * req:{
 *     room
 * }
 * res:{
 *     events: Array of events
 * }
 *
 * **/

router.get('/getPreviousMessages', roomController.getPreviousMessages);
/**
 * req:{
 *     room
 * }
 * res:{
 *     messages:Array of messages
 * }
 *
 * **/

router.delete('/deleteEvent', roomController.deleteEvent);
/**
 * req:{
 *     eventId
 * }
 * res:{
 *     message:"Event deleted"
 * }
 *
 * **/

router.get('/getPhotos',roomController.getPhotos);
/**
 * req:{
 *     room
 * }
 * res:{
 *     photos: Array of photo keys,
 *     message "Keys retrieved"
 * }
 *
 * //further refining to be done
 * **/


module.exports = router;