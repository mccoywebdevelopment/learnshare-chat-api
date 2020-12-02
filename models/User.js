var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name:{type:String,required:true},
    dateCreated:{type:Date,required:true},
    refID:{type:String},
    expTokens: [
        {
          type: String,
        },
      ],
});

module.exports = mongoose.model("User", UserSchema);