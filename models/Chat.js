var mongoose = require("mongoose");

var ChatSchema = new mongoose.Schema({
    title:{type:String,required:true},
    refID:{type:String,required : true},
    dateCreated:{type:Date,required:true},
    uniqueKey:{type:String,required:true,select:false},
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    messages:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

module.exports = mongoose.model("Chat", ChatSchema);

