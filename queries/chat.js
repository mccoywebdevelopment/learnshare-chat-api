const ChatModel = require('../models/Chat');
const UserModel = require('../models/User');
const crypto = require('crypto');
const { createUser } = require('../queries/user');

function findChatsByCourseID(courseID, userID, callback) {
    ChatModel.find({ refID: courseID }).populate('users').exec(function (err, chats) {
        if (err) {
            callback(err);
        } else {
            let arr = [];
            for(var i=0;i<chats.length;++i){
                for(var ix=0;ix<chats[i].users.length;++ix){
                    if(chats[i].users[ix].refID == userID){
                        arr.push(chats[i]);
                    }
                }
            }
            callback(null, arr);
        }
    });
}


function findChatByID(chatID,callback) {
   ChatModel.findById(chatID).populate('users').exec(function(err,chatFound){
    if(err){
        callback(err);
    }else{
        callback(null,chatFound);
    }
   });
}

function createChat(courseID, title, users, callback) {
    let chat = new ChatModel({
        title: title,
        refID: courseID,
        dateCreated: new Date(),
        uniqueKey: crypto.randomBytes(64).toString('hex')
    });

    if(users && users.length>0){
        createUsers(users,function(err,users){
            if(err){
                callback(err);
            }else{
                chat.users = users;

                chat.save(function (err, docSaved) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, docSaved);
                    }
                });
            }
        });
    }else{
        chat.save(function (err, docSaved) {
            if (err) {
                callback(err);
            } else {
                callback(null, docSaved);
            }
        });
    }
}

function createUsers(users, callback) {
    let usersArr = [];

    users.forEach((ele) => {
        createUser(ele.name,ele.refID,ele.isAdmin,function(err,userCreated){
            if(err){
                callback(err);
                return;
            }

            usersArr.push(userCreated);

            if (usersArr.length == users.length) {
                callback(null, usersArr);
                return;
            }
        });
    });
}

function addUsers(users,chatID,callback){
    // need to first findByID 
    // !found
    // create user
    getUsers(users,function(err,users){
        if(err){
            callback(err);
        }else{
            ChatModel.findOneAndUpdate({_id:chatID},{ $push: { users: users } }).exec(function(err,chatFound){
                if(err){
                    callback(err);
                }else if(!chatFound){
                    callback("chat not found");
                }else{
                    callback(null,chatFound);
                }
            });
        }
    });
    
}

function getUsers(users,callback){
    let usersArr = [];
    users.forEach((user)=>{
        UserModel.findOne({refID:user.refID},function(err,userFound){
            if(err){
                callback(err);
                return;
            }

            if(!userFound){
                createUser(user.name,user.refID,user.isAdmin,function(err,userCreated){
                    if(err){
                        callback(err);
                        return;
                    }else{
                        usersArr.push(userCreated);
                    }
                });
            }else{
                usersArr.push(userFound);
            }

            if (usersArr.length == users.length) {
                callback(null, usersArr);
                return;
            }
        });
    });
}
module.exports = { findChatsByCourseID, createChat , findChatsByCourseID, findChatByID, addUsers} 
