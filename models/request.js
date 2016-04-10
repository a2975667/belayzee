// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var replySchema = new Schema({
    replyID: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 9999,

    },
    comment: {
        type: String,

    }
}, {
    timestamps: true
});

// create a schema
var requestSchema = new Schema({
    requestName: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    Token: {
        type: Number,
        min: 1,
        max: 9999,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    completeTime: {
        type: String,
        //required: true
    },
    Catagory: {
        type: String
    },
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

// the schema is useless so far
// we need to create a model using it
var Requests = mongoose.model('Request', requestSchema);

// make this available to our Node applications
module.exports = Requests;
