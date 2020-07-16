const Room = require('../models/room');
const Event = require('../models/event');
const Message = require('../models/message');
const User = require('../models/user');
const AWS = require('aws-sdk');
const dotenv = require('dotenv').config();
const fs = require('fs');

exports.createEvent = async(req,res,next) => {
  const date = req.body.date;
  const content = req.body.content;
  const room = req.body.room;
  console.log(date,content,room);
  try{
      const newEvent = new Event({
          room: room,
          content: content,
          date: date
      });
      await newEvent.save();
      const saveRoom = await Room.findOne({name:room});
      saveRoom.events.push(newEvent);
      await saveRoom.save();
      res.status(200).json({ message: 'Event created' });
  }
  catch(err){
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }

};

exports.getEvents = async (req,res,next) => {
   const room = req.body.room;
   try{
       //const findRoom = await Room.findOne({name:room});
       const events = await Event.find({room: room});
       console.log(events);
       res.status(200).json({ events: events });
   }
   catch(err){
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   }
};

exports.deleteEvent = async(req,res,next) => {
    const eventId = req.body._id;
    console.log(eventId);
    try{
        const event = await Event.deleteOne(eventId);
        if(!event){
            const error = new Error('Could not find event.');
            error.statusCode = 404;
            throw error;
        }
        await Event.findByIdAndRemove(eventId);
        const room = await Room.findOne({name:req.body.room});
        room.events.pull(eventId);
        await room.save();
        res.status(200).json({ message: "Event deleted"})
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPreviousMessages = async(req,res,next) => {
  const room = req.body.room;
  try{
      const messages = await Message.find({room: room});
      console.log(messages);
      res.status(200).json({ messages: messages });
  }catch(err){
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }
};

AWS.config.region = 'us-east-1'
AWS.config.update({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
})
const s3 = new AWS.S3();

exports.getPhotos = (req,res,next) => {
    const room = req.body.room;
    try {
        let contents;
        const photos = [];
        s3.listObjects({Bucket: room, MaxKeys: 100}, (err, data) => {
            if (err) {
                console.log(err, err.stack);
            } else {
                contents = data.Contents;
                contents.forEach(content => {
                    photos.push(content.Key);
                })
                console.log(photos);
                res.status(200).json({ photos: photos, message:"Keys of photos retrieved."})
            }
        })
    }catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}