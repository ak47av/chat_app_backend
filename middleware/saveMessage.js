const Room = require('../models/room');
const Message = require('../models/message');

module.exports = async(user,room,message) =>{
    const saveMessage = new Message({
        user: user,
        room: room,
        content: message
    });
    try{
        const saveRoom = await Room.findOne({ name: room });
        console.log(saveRoom.name);
        const result = await saveMessage.save();
        saveRoom.messages.push(saveMessage);
        await saveRoom.save();
        console.log(result);
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
    }
};