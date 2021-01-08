const express = require('express');
const router = express.Router();
const chatQ = require('../queries/chat');
const { verifyUserRoute } = require('../config/firebaseAuth');

router.route("/create/:uuid")
.post(verifyUserRoute,function(req,res){
    let courseID = req.body.courseID;
    let users = req.body.users;
    let title = req.body.title;

    chatQ.createChat(courseID,title,users,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

router.route("/get_chats/:userID/:courseID/:uuid")
.get(verifyUserRoute,function(req,res){
    let id = req.params.courseID;
    let userID = req.params.userID;
    chatQ.findChatsByCourseID(id,userID,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

router.route("/get_chat/:id/:uuid")
.get(verifyUserRoute,function(req,res){
    let id = req.params.id;
    chatQ.findChatByID(id,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

router.route("/add_users/:id/:uuid")
.post(verifyUserRoute,function(req,res){
    let id = req.params.id;
    chatQ.addUsers(req.body.users,id,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

router.route("/create-default/:uuid")
.post(verifyUserRoute,function(req,res){
    chatQ.createDefaultChats(req.body.courseID,req.body.users,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

router.route("/leave/:chatID/:refUserID/:uuid")
.post(verifyUserRoute,function(req,res){
    chatQ.leaveChat(req.params.chatID,req.params.refUserID,function(err,result){
        if(err){
            console.log(err);
            res.status(404).json({error:err});
        }else{
            res.send(result);
        }
    });
});

module.exports = router;