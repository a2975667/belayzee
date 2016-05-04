/**
 * Created by tcheng on 3/21/16.
 * part of the schema here is ment to be expanded afterwards
 *
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');

// define the schema for our user model
var userSchema = mongoose.Schema({
    //local login method
    local            : {
        email        : String,
        password     : String
    },
    //facebook login, not developed
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    //twitter login, not developed
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    //google login, not developed
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    //profile of the user
    profile          :{
        displayName: String,
        tokens: {
            type: Number,
            default: 1000
        },
        //dictionary array of all requests proposed
        requests: [{
          id: String,
          title: String
        }],
        //dictionary array of all replies proposed
        replies:[{
          id: String,
          title: String,
          status: {
            type: String,
            default: "pending"
          }
        }]
    }

});

userSchema.plugin(timestamps);

// generating a hash for password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
