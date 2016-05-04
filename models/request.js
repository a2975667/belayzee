/**
 * Created by sunny
 * updated and modified by tcheng
 */

// Schema for request
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var requestSchema = new Schema({
    //name of request
    requestName: {
        type: String,
        required: true
    },
    //userID of request
    userID: {
        type: String,
        required: true
    },
    //username of request
    userName: {
        type: String,
        required: true
    },
    //token required for the request
    Token: {
        type: Number,
        min: 1,
        max: 9999,
        required: true
    },
    //description of the request
    description: {
        type: String,
        required: true
    },
    //the contact number for user
    completeTime: {
        type: String,
    },
    //category of the request
    Catagory: {
        type: String
    },
    //dictionary array that stores the replies from other users
    Replies: [{
      userid: String,
      username: String,
      status: {
        type: String,
        default: "pending"
      }
    }]

}, {
    timestamps: true
});

// make this available to our Node applications
var Requests = mongoose.model('Request', requestSchema);
module.exports = Requests;
