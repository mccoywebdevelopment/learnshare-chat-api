const ChatModel = require('../models/Chat');
const UserModel = require('../models/User');
const crypto = require('crypto');
const { createUser } = require('../queries/user');
const Chat = require('../models/Chat');

function findChatsByCourseID(courseID, userID, callback) {
    ChatModel.find({ refID: courseID }).populate('users').exec(function (err, chats) {
        if (err) {
            callback(err);
        } else {
            let arr = [];
            for (var i = 0; i < chats.length; ++i) {
                for (var ix = 0; ix < chats[i].users.length; ++ix) {
                    if (chats[i].users[ix].refID == userID) {
                        arr.push(chats[i]);
                    }
                }
            }
            callback(null, arr);
        }
    });
}


function findChatByID(chatID, callback) {
    ChatModel.findById(chatID).populate('users').exec(function (err, chatFound) {
        if (err) {
            callback(err);
        } else {
            callback(null, chatFound);
        }
    });
}

function updateChatDoc(oldChat, users, title, refID, callback) {
    let body = {
        title: title,
        users: users,
        refID: refID
    }
    Chat.findOneAndUpdate({ _id: oldChat._id }, body, function (err, updatedChat) {
        if (err) {
            callback(err);
        } else {
            callback(null, updatedChat);
        }
    });
}
function updateChat(chatID, courseID, users, title, callback) {
    Chat.findById(chatID).populate('users').exec(function (err, chat) {
        if (err) {
            callback(err);
        } else if (!chat) {
            createChat(courseID, title, users, function (err, chatCreated) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, chatCreated);
                }
            });
        } else if (users && users.length > 0) {
            createUsers(users, function (err, usersCreated) {
                if (err) {
                    callback(err);
                } else {
                    updateChatDoc(chat,usersCreated, title, courseID, function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, result);
                        }
                    });
                }
            });
        } else {
            updateChatDoc(chat,users, title, courseID, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

function createDefaultChats(courseID, users, callback) {
    if (!courseID) {
        callback("CourseID not provided");
        return;
    }

    Chat.find({ refID: courseID }, function (err, chatsFound) {
        if (err) {
            callback(err);
        } else {
            let defaultChats = [];
            for (var i = 0; i < chatsFound.length; ++i) {
                if (chatsFound[i].title.toLowerCase() == 'general' || chatsFound[i].title.toLowerCase() == 'admin') {
                    defaultChats.push(chatsFound[i]);
                }
            }

            if (defaultChats.length < 1) {
                updateChat(null, courseID, users, "General", function (err, generalChat) {
                    if (err) {
                        callback(err);
                    } else {
                        let usersArr = [];
                        for (var i = 0; i < users.length; ++i) {
                            if (users[i].isAdmin == true) {
                                usersArr.push(users[i]);
                            }
                        }
                        updateChat(null, courseID, usersArr, "Admin", function (err, adminChat) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, [generalChat, adminChat]);
                            }
                        });
                    }
                });
            } else {
                updateChat(defaultChats[0]._id, courseID, users, "General", function (err, generalChat) {
                    if (err) {
                        callback(err);
                    } else {
                        let usersArr = [];
                        for (var i = 0; i < users.length; ++i) {
                            if (users[i].isAdmin == true) {
                                usersArr.push(users[i]);
                            }
                        }
                        updateChat(defaultChats[1]._id, courseID, usersArr, "Admin", function (err, adminChat) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, [generalChat, adminChat]);
                            }
                        });
                    }
                });
            }
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

    if (users && users.length > 0) {
        createUsers(users, function (err, users) {
            if (err) {
                callback(err);
            } else {
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
    } else {
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
        createUser(ele.name, ele.refID, ele.isAdmin, function (err, userCreated) {
            if (err) {
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

function addUsers(users, chatID, callback) {
    // need to first findByID 
    // !found
    // create user
    getUsers(users, function (err, users) {
        if (err) {
            callback(err);
        } else {
            ChatModel.findOneAndUpdate({ _id: chatID }, { $push: { users: users } }).exec(function (err, chatFound) {
                if (err) {
                    callback(err);
                } else if (!chatFound) {
                    callback("chat not found");
                } else {
                    callback(null, chatFound);
                }
            });
        }
    });

}

function getUsers(users, callback) {
    let usersArr = [];
    users.forEach((user) => {
        UserModel.findOne({ refID: user.refID }, function (err, userFound) {
            if (err) {
                callback(err);
                return;
            }

            if (!userFound) {
                createUser(user.name, user.refID, user.isAdmin, function (err, userCreated) {
                    if (err) {
                        callback(err);
                        return;
                    } else {
                        usersArr.push(userCreated);
                    }
                });
            } else {
                usersArr.push(userFound);
            }

            if (usersArr.length == users.length) {
                callback(null, usersArr);
                return;
            }
        });
    });
}

function leaveChat(chatID,refUserID,callback){
    ChatModel.findById(chatID).populate('users').exec(function(err,chatFound){
        if(err){
            callback(err);
        }else{
            let found = false;
            let usersArr = [];
            for(var i=0;i<chatFound.users.length;++i){
                if(chatFound.users[i].refID == refUserID){
                    found = true;
                }else{
                    usersArr.push(chatFound.users[i]);
                }
            }
            if(!found){
                callback("User not found");
            }else{
                chatFound.users = usersArr;
                chatFound.save(function(err,savedDoc){
                    if(err){
                        callback(err);
                    }else{
                        callback(null,savedDoc);
                    }
                });
            }
        }
    });
}

module.exports = { findChatsByCourseID, leaveChat, createChat, createDefaultChats, findChatsByCourseID, findChatByID, addUsers } 
