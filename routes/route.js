/**
 * Created by tcheng on 3/21/16.
 */
var User = require('../models/user');
var Requests = require('../models/request');

module.exports = {
    authenticate: function(app, passport) {

        app.get('/', function(req, res) {
            var user;
            var status;
            if (req.isAuthenticated()) {
                user = req.user;
                status = "Login";
            } else {
                user = req.user;
                status = "Logout";
            }
            res.render('index', {
                title: 'Homepage',
                user: user,
                status: status
            });
        });

        app.get('/request', isLoggedIn, function(req, res) {
            res.render('form', {
                user: req.user
            });
        });

        app.post('/request', isLoggedIn, function(req, res, next) {
            if (req.xhr || req.accepts('json,html') === 'json') {
                if (req.body.title) {
                    Requests.create({
                            requestName: req.body.title,
                            userID: req.user._id,
                            userName: req.user.profile.displayName,
                            Token: req.body.token,
                            description: req.body.description,
                            completeTime: "11:50",
                            Catagory: "Banana"
                        },
                        function(err, request, next) {
                            if (err) throw err;
                            console.log('request created!');
                            console.log(req.user.profile.requests);
                            var newreq = {
                                id: request._id,
                                title: request.requestName
                            }
                            var cost = request.Token;
                            User.findById(req.user._id, function(err, u) {
                                //console.log(Session[0])
                                if (err) {}
                                console.log(u);
                                var newtoken = u.profile.tokens - cost;

                                u.profile.requests.push(newreq);
                                u.profile.tokens = newtoken;
                                u.save(function(err) {
                                    if (err) {} else {}
                                    console.log('Updated');
                                });
                            });
                        });
                }
            } else {
                //console.log("error");
                //res.redirect(303, '/error');
            }

        });

        app.post('/reply', isLoggedIn, function(req, res) {
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    if (err) throw err;
                    request.Replies.push({
                        userid: req.user._id,
                        username: req.user.profile.displayName
                    });
                    request.save(function(err, request) {
                        if (err) throw err;
                        console.log('Updated reply!');
                    });
                });
            User.findById(req.user._id,
                function(err, user) {
                    if (err) throw err;
                    console.log(user);
                    user.profile.replies.push({
                        id: req.body.requestId,
                        title: req.body.name
                    });
                    user.save(function(err, user) {
                        if (err) throw err;
                        console.log("updated user");
                    });
                });
        });

        app.post('/replied', isLoggedIn, function(req, res) {
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    if (err) throw err;
                    var tmp = request.Replies;
                    request.Replies = tmp.filter(function(e) {
                        return e.userid !== req.user._id+'';
                    });
                    console.log(request.Replies);
                    request.save(function(err, request) {
                        if (err) throw err;
                        console.log('Fuck you!!');
                    });
                });
            User.findById(req.user._id,
                function(err, user) {
                    if (err) throw err;
                    console.log(user);
                    var tmp = user.profile.replies;
                    user.profile.replies = tmp.filter(function(e) {
                        return e.id !== req.body.requestId;
                    });
                    user.save(function(err, user) {
                        if (err) throw err;
                        console.log("updated user");
                    });
                });
        });

        app.get('/requests/:requestId', function(req, res) {
            Requests.findById(
                req.params.requestId,
                function(err, request) {
                    if (err) throw err;
                    var user;
                    var status;
                    var replyStat = false;
                    var renderfile = 'request_public.ejs';
                    if (req.isAuthenticated()) {
                        user = req.user;
                        status = "Login";
                        for (var n = 0; n < req.user.profile.requests.length; n++) {
                            if (req.user.profile.requests[n].id == req.params.requestId) {
                                console.log("found!");
                                renderfile = 'request_user.ejs'
                                break;
                            }
                        }
                        for (var n = 0; n < req.user.profile.replies.length; n++) {
                            if (req.user.profile.replies[n].id == req.params.requestId)
                                console.log("hasreplied");
                            replyStat = true;
                        }
                    } else {
                        user = req.user;
                        status = "Logout";
                    }

                    res.render(renderfile, {
                        request: request,
                        user: user,
                        status: status,
                        replyStat: replyStat
                    });
                });
        });

        //login--get//
        app.get('/login', function(req, res) {
            res.render('login.ejs', {
                message: req.flash('loginMessage')
            });
        });

        app.get('/requests', function(req, res, next) {
            Requests.find({}, function(err, request) {
                console.log("/requests/" + request[0]._id);
                if (err) throw err;
                var user;
                var status;
                if (req.isAuthenticated()) {
                    user = req.user;
                    status = "Login";
                } else {
                    user = req.user;
                    status = "Logout";
                }
                res.render('request.ejs', {
                    request: request,
                    user: user,
                    status: status
                });
            });
        });

        //login--post//
        app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));

        //signup--get//
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', {
                message: req.flash('signupMessage')
            });
            console.log("here!");
        });

        //signup--post//
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/profile',
            failureRedirect: '/signup',
            failureFlash: true
        }));


        //userprofile--get
        app.get('/profile', isLoggedIn, function(req, res) {
            User.find({
                "local.email": req.user.local.email
            }, function(err, docs) {
                //console.log("====")
                //console.log(docs);
                res.render('user.ejs', {
                    user: req.user
                });
            });
        });



        //logout--get
        app.get('/logout', function(req, res) {
            req.logout();
            req.res.redirect('/');
        });
    }

}


//middleware and methods

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');

}
