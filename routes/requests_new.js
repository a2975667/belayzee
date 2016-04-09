var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Requests = require('../models/request');

var requestRouter = express.Router();
requestRouter.use(bodyParser.json());
/*
requestRouter.route('/')
.get(function (req, res, next) {
    Requests.find({}, function (err, request) {
        if (err) throw err;
        res.json(request);
    });
})

.post(function (req, res, next) {
    Requests.create(req.body, function (err, request) {
        if (err) throw err;
        console.log('request created!');
        var id = request._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the request with id: ' + id);
    });
})

.delete(function (req, res, next) {
    Requests.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});*/

requestRouter.route('/:requestId')
.get(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        res.json(request);
    });
})

.put(function (req, res, next) {
    Requests.findByIdAndUpdate(req.params.requestId, {
        $set: req.body
    }, {
        new: true
    }, function (err, request) {
        if (err) throw err;
        res.json(request);
    });
})

.delete(function (req, res, next) {
    Requests.findByIdAndRemove(req.params.requestId, function (err, resp) {        if (err) throw err;
        res.json(resp);
    });
});


requestRouter.route('/:requestId/reply')
.get(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        res.json(request.reply);
    });
})

.post(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        request.reply.push(req.body);
        request.save(function (err, request) {
            if (err) throw err;
            console.log('Updated reply!');
            res.json(request);
        });
    });
})

.delete(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        for (var i = (request.reply.length - 1); i >= 0; i--) {
            request.reply.id(request.reply[i]._id).remove();
        }
        request.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all reply!');
        });
    });
});

requestRouter.route('/:requestId/reply/:replyID')
.get(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        res.json(request.reply.id(req.params.replyID));
    });
})

.put(function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Requests.findById(req.params.requestId, function (err, request) {
        if (err) throw err;
        request.reply.id(req.params.replyID).remove();
        request.reply.push(req.body);
        request.save(function (err, request) {
            if (err) throw err;
            console.log('Updated reply!');
            res.json(request);
        });
    });
})

.delete(function (req, res, next) {
    Requests.findById(req.params.requestId, function (err, request) {
        request.reply.id(req.params.replyID).remove();
        request.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = requestRouter;
