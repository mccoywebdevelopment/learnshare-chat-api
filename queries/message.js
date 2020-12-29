const MessageModel = require('../models/Message');

function create(msg,user,date,chatID,callback){
    let Message = new MessageModel({
        data:msg,
        dateCreated:date,
        chatID:chatID,
        createdBy:user,
    });

    Message.save(function(err,msg){
        if(err){
            callback(err);
        }else{
            callback(null,msg);
        }
    });
}

module.exports = { create }