var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
    data:{type:String,required:true},
    dateCreated:{type:date,required:true},
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Message", MessageSchema);