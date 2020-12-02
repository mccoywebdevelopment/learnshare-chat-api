var mongoose = require("mongoose");

var ChatSchema = new mongoose.Schema({
    title:{type:String,required:true},
    refID:{type:String},
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

module.exports = mongoose.model("Message", MessageSchema);

