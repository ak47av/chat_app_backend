const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const eventSchema = new Schema({
        room:{
            type: String,
            required:true
        },
        content:{
            type: String,
            required: true
        },
        date:{
            type: String,
            required: true
        }
    }, {timestamps:true}
);

module.exports = mongoose.model('Event',eventSchema);