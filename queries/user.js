const UserModel = require('../models/User');

function createUser(name,uuid,isAdmin,callback){
    let userBody = {
        name:name,
        dateCreated:new Date(),
        refID:uuid,
        isAdmin:isAdmin
    }
    let user = new UserModel(userBody);

    UserModel.findOneAndUpdate({refID:uuid},userBody,function(err,duplicateUser){
        if(err){
            callback(err);
        }else if(!duplicateUser){
            user.save(function(err,savedDoc){
                if(err){
                    callback(err);
                }else{
                    callback(null,savedDoc);
                }
            });
        }else{
            callback(null,duplicateUser);
        }
    });

}

module.exports = { createUser }