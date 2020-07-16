const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const roomSchema = new Schema({
        name:{
          type:String,
          required:true
        },
        user1:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user2:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        messages:[{
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }],
        events:[{
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }]
    },
    { timestamps : true }
);

module.exports = mongoose.model('Room',roomSchema);