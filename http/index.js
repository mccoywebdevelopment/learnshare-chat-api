const io = require("../index").io;
const ChatModel = require('../models/Chat');
const UserModel = require('../models/User');
const crypto = require('crypto');
const createMessage = require('../queries/message').create;

io.on('connection', function (socket) {
    console.log('\n' + (socket._user.name || socket._user.email) + ' has connected to the server');

    let courseID = socket.handshake.query['courseID'];
    let userID = socket.handshake.query['userID'];
    let errMessage = "";

    if (!courseID) {
        errMessage = "ERROR: Course ID is not provided.";
        console.log("\n" + errMessage);
        socket.emit('error', errMessage);
    } else if (!userID) {
        errMessage = "ERROR: User ID is not provided.";
        console.log("\n" + errMessage);
        socket.emit('error', errMessage);
    } else {
        ChatModel.find({ refID: courseID }).populate('users').populate('messages').select('+uniqueKey').exec((err, chats) => {
            if (err) {
                console.log("\n" + err);
                socket.emit('error', err);
            } else {
                UserModel.populate(chats, { path: "messages.createdBy" }, function (err, chats) {
                    if (err) {
                        console.log("\n" + err);
                        socket.emit('error', err);
                    } else {
                        let arr = [];
                        for (var i = 0; i < chats.length; ++i) {
                            for (var ix = 0; ix < chats[i].users.length; ++ix) {
                                if (chats[i].users[ix].refID == userID) {
                                    arr.push(chats[i]);
                                }
                            }
                        }

                        chats = arr;

                        if (chats.length < 1) {
                            errMessage = "No chats";
                            console.log("\n" + errMessage);
                            socket.emit('error', errMessage);
                        } else {
                            for (var i = 0; i < chats.length; ++i) {
                                room(socket, chats[i]);
                            }
                        }
                    }
                });
            }
            socket.on("disconnect", function () {
                console.log('\n' + (socket._user.name || socket._user.email) + ' has disconnected from the server');
            });
        });
    }
});

function room(socket, chat) {
    let key = chat.uniqueKey;
    socket.join("room-" + key);
    console.log('\n' + (socket._user.name || socket._user.email) + " entered in room: " + chat.title);

    io.in("room-" + key).emit('GET OLD MESSAGES FROM SERVER CHAT_ID=' + chat._id, chat.messages);

    socket.in("room-" + key).on('SEND MESSAGE FROM CLIENT CHAT_ID=' + chat._id, (messageObj) => {

        let date = new Date();

        let clientMsg = {
            dateCreated: date,
            chatName: chat.name,
            chatID: messageObj.chatID,
            createdBy: messageObj.userID,
            data: messageObj.message,
            _id: crypto.randomBytes(64).toString('hex')
        }

        saveMessageToChat(messageObj.message, messageObj.userID, messageObj.chatID, date, function (err, messageCreated) {
            if (err) {
                console.log("\n" + err);
                socket.emit('error', err);
            }
        });

        io.in("room-" + key).emit('GET MESSAGE FROM SERVER CHAT_ID=' + chat._id, clientMsg);
    });
}

function saveMessageToChat(msg, userID, chatID, date, callback) {
    ChatModel.findById(chatID).populate('users').populate('messages').exec(function (err, chat) {
        if (err) {
            callback(err);
        } else {
            let user = null;
            for (var i = 0; i < chat.users.length; ++i) {
                if (chat.users[i].refID == userID) {
                    user = chat.users[i];
                    break;
                }
            }

            createMessage(msg, user, date, chatID, function (err, messageCreated) {
                if (err) {
                    callback(err);
                } else {
                    chat.messages.push(messageCreated);

                    chat.save(function (err, savedDoc) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, savedDoc);
                        }
                    });
                }
            });
        }
    });

}