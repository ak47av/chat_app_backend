const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const dotenv = require('dotenv').config();

const User = require('../models/user');
const Room = require('../models/room');


AWS.config.region = 'us-east-1'
const s3 = new AWS.S3({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
})

exports.signup = async(req,res,next) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     const error = new Error('Validation failed.');
    //     error.statusCode = 422;
    //     error.data = errors.array();
    //     throw error;
    // }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
      const hashedPw = await bcrypt.hash(password, 12);

      const user = new User({
          email: email,
          name: name,
          password: hashedPw
      });
      const result = await user.save();
      res.status(201).json({ message: 'User created!', userId: result._id, name:name });
  } catch (err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
      console.log(err);
  }
};

exports.login = async (req,res,next) => {
    const name = req.body.name;
    const password= req.body.password;
    let loadedUser;
    try{
        const user = await User.findOne({ name:name });
        if(!user){
            const error = new Error('A user with this name could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const u1 = await Room.findOne({ user1:user });
        const u2 = await Room.findOne({ user2:user });
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'onlysithdealinabsolutes',
            { expiresIn: '5h' }
        );
        if(!u1 && !u2){
            res.status(200).json({ token:token, userId: loadedUser._id.toString(), room: null  });
        }

        if(u1){
            res.status(200).json({ token:token, userId: loadedUser._id.toString(), room: u1.name });
        }
        if(u2){
            res.status(200).json({ token:token, userId: loadedUser._id.toString(), room: u2.name  });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createRoom = async (req,res,next) => {
  const user1 = req.body.user1;
  const user2 = req.body.user2;
  const roomName = user1 + user2;
  const bucketName = (user1+user2).toLowerCase();
  try{
      const u1 = await User.findOne({ name:user1 });
      const u2 = await User.findOne({ name:user2 });
      if(!u1 || !u2){
          const error = new Error('A user with either of the names could not be found.');
          error.statusCode = 401;
          throw error;
      }
      const room = new Room({
          name:user1 + '_' + user2,
          user1: u1,
          user2: u2
      });
      const result = await room.save();
      u1.room = result;
      u2.room = result;
      await u1.save();
      await u2.save()
      s3.createBucket({Bucket:bucketName},(err,data)=>{
          if(err){
              console.log(err, err.stack);
          }
          else console.log(data);
      })
      res.status(200).json({ message: 'Room created!', roomId: result._id, room: roomName });
      console.log("Room created with " + user1 + ' and ' + user2);
  } catch (err){
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }
};

