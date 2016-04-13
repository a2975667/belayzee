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

        app.get('/aboutus', function(req, res) {
            res.render('about_us.ejs', {
                user: req.user
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
                            completeTime: req.body.expiretime,
                            Catagory: req.body.category
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
                        return e.userid !== req.user._id + '';
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

        app.post('/deleteRequest', isLoggedIn, function(req, res) {
            var userwith = [];
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    console.log(request);
                    var token = request.Token;
                    if (err) throw err;
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    var owner = request.userID;
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                console.log(e.id);
                                console.log(req.body.requestId);
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            console.log(current)
                            console.log(token);
                            console.log(parseInt(current) + parseInt(token))
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            console.log("*******");
                            console.log(user);
                            console.log("*******");
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                    for (var m = 0; m < userwith.length; m++) {
                        User.findById(userwith[m],
                            function(err, user) {
                                if (err) throw err;
                                var tmp = user.profile.replies;
                                user.profile.replies = tmp.filter(function(e) {
                                    return e.id !== req.body.requestId;
                                });
                                user.save(function(err, user) {
                                    if (err) throw err;
                                    console.log("updated user");
                                });
                            });
                    }
                    Requests.findByIdAndRemove(req.body.requestId, function(err, resp) {
                        if (err) throw err;
                        console.log("deleted request");
                    });

                });
        });

        app.post('/completeRequest', isLoggedIn, function(req, res) {
            var userwith = [];
            var completeUser = req.body.userId;
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    console.log(request);
                    var token = request.Token;
                    if (err) throw err;
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    var owner = request.userID;
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                console.log(e.id);
                                console.log(req.body.requestId);
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                    User.findById(completeUser,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                console.log(e.id);
                                console.log(req.body.requestId);
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                    for (var m = 0; m < userwith.length; m++) {
                        User.findById(userwith[m],
                            function(err, user) {
                                if (err) throw err;
                                var tmp = user.profile.replies;
                                user.profile.replies = tmp.filter(function(e) {
                                    return e.id !== req.body.requestId;
                                });
                                user.save(function(err, user) {
                                    if (err) throw err;
                                    console.log("updated user");
                                });
                            });
                    }
                    Requests.findByIdAndRemove(req.body.requestId, function(err, resp) {
                        if (err) throw err;
                        console.log("deleted request");
                    });

                });
        });

        app.get('/requests/:requestId', function(req, res, next) {
            Requests.findById(
                req.params.requestId,
                function(err, request) {
                    //if (err) throw err;
                    if (err) {
                        return next(new Error());
                    }
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
                            if (req.user.profile.replies[n].id == req.params.requestId){
                                console.log("hasreplied");
                            replyStat = true;}
                        }

                    } else {
                        user = {
                            local: {},
                            facebook: {},
                            twitter: {},
                            google: {},
                            profile: {
                                tokens: 0,
                                requests: [],
                                replies: [],
                                displayName: 'Public user'
                            },
                            _id: "xxxxxxxx"
                        }
                        status = "Logout";
                        //renderfile = "login.ejs"
                    }
                    console.log({
                        request: request,
                        user: user,
                        status: status,
                        replyStat: replyStat
                    });
                    res.render(renderfile, {
                        request: request,
                        user: user,
                        status: status,
                        replyStat: replyStat
                    });
                });
        });

        app.post('/confirmtask', isLoggedIn, function(req, res) {
            console.log(req.body);
            var oldActive;
            Requests.findById(req.body.requestId, function(err, request) {
                if (err) throw err;
                console.log(request);
                for (var j = 0; j < request.Replies.length; j++) {
                    if ((request.Replies[j].userid + '') === (req.body.userId + '')) {
                        request.Replies[j].status = "active";
                    } else {
                        if (request.Replies[j].status = "active") {
                            oldActive = request.Replies[j].userid
                        }
                        request.Replies[j].status = "pending";
                    }
                    console.log(request)
                    request.save(function(err, request) {
                        if (err) throw err;
                        console.log("updated");
                    });
                }
                User.findById(req.body.userId, function(err, user) {
                    if (err) throw err;
                    console.log(user);
                    console.log("-----");
                    console.log(user.profile);
                    for (var j = 0; j < user.profile.replies.length; j++) {
                        console.log((user.profile.replies[j].id + '') == (req.body.requestId + ''));
                        console.log(req.body.requestId);
                        if ((user.profile.replies[j].id + '') == (req.body.requestId + '')) {
                            console.log("changing");
                            console.log(user.profile.replies[j].status);
                            user.profile.replies[j].status = "active";
                        }
                        console.log(user);
                        user.save(function(err, user) {
                            if (err) throw err;
                            console.log("updated owner");
                        });

                    }
                    if (!!oldActive) {
                        User.findById(oldActive, function(err, user) {
                            if (err) throw err;
                            console.log(user);
                            for (var j = 0; j < user.profile.replies.length; j++) {
                                console.log((user.profile.replies[j].id + '') == (req.body.requestId + ''));
                                console.log(req.body.requestId);
                                if ((user.profile.replies[j].id + '') == (req.body.requestId + '')) {
                                    console.log("changing");
                                    console.log(user.profile.replies[j].status);
                                    user.profile.replies[j].status = "pending";
                                }
                                console.log(user);
                                user.save(function(err, user) {
                                    if (err) throw err;
                                    console.log("updated owner");
                                });

                            }
                        });
                    }
                });


            });


        });

        app.get('/update/request/:updaterequestId', isLoggedIn, function(req, res, next) {
            console.log(req.params.updaterequestId);
            Requests.findById(
                req.params.updaterequestId,
                function(err, request) {
                    console.log(request);
                    if (err) {
                        return next(new Error());
                    }
                    var user = req.user;
                    var status = "Login";
                    var renderfile = 'updateform.ejs';
                    console.log(req.user._id);
                    console.log(request.userID);
                    if ((req.user._id + '') !== (request.userID + '')) {
                        renderfile = "error.ejs";
                        console.log('error!');
                    }
                    res.render(renderfile, {
                        request: request,
                        user: user,
                        status: status
                    });
                });

        });

        app.post('/update/request/:updaterequestId', isLoggedIn, function(req, res) {
            var userwith = [];
            Requests.findById(
                req.params.updaterequestId,
                function(err, request) {
                    console.log(request);
                    var token = request.Token;
                    if (err) throw err;
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    var owner = request.userID;
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            console.log(user);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                console.log(e.id);
                                console.log(req.params.updaterequestId);
                                return e.id !== req.params.updaterequestId;
                            });
                            var current = user.profile.tokens;
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                            Requests.findByIdAndUpdate(req.params.updaterequestId, {
                                requestName: req.body.title,
                                Token: req.body.token,
                                Catagory: req.body.category,
                                completeTime: req.body.expiretime,
                                description: req.body.description
                            }, {
                                new: true
                            }, function(err, request) {
                                if (err) throw err;
                                var activeuser = undefined;
                                for (var j = 0; j < request.Replies.length; j++) {
                                    if ((request.Replies[j].status) === "active") {
                                        activeuser = request.Replies[j].userid;
                                    }
                                }

                                User.findById(owner,
                                    function(err, user) {
                                        if (err) throw err;
                                        user.profile.requests.push({
                                            id: req.params.updaterequestId,
                                            title: req.body.title
                                        });

                                        var current = user.profile.tokens;
                                        user.profile.tokens = parseInt(current) - parseInt(req.body.token);

                                        user.save(function(err, user) {
                                            if (err) throw err;
                                            console.log("updated owner");
                                        });

                                        for (var m = 0; m < userwith.length; m++) {
                                            User.findById(userwith[m],
                                                function(err, user) {
                                                    if (err) throw err;
                                                    var tmp = user.profile.replies;
                                                    user.profile.replies = tmp.filter(function(e) {
                                                        return e.id !== req.params.updaterequestId;
                                                    });
                                                    user.save(function(err, user) {
                                                        if (err) throw err;
                                                        console.log("updated user");
                                                    });
                                                });
                                        }

                                        for (var m = 0; m < userwith.length; m++) {
                                            User.findById(userwith[m],
                                                function(err, user) {
                                                    if (err) throw err;
                                                    status = "pending"
                                                    console.log("-------==" + activeuser);
                                                    console.log("-------==" + !!activeuser);
                                                    console.log("-------==" + user._id);
                                                    console.log("-------==" + user);
                                                    if (!!activeuser) {
                                                        if ((user._id + '') == (activeuser + '')) {
                                                            status = "active";
                                                        }
                                                    }
                                                    user.profile.replies.push({
                                                        id: req.params.updaterequestId,
                                                        title: req.body.title,
                                                        status: status
                                                    });

                                                    user.save(function(err, user) {
                                                        if (err) throw err;
                                                        console.log("updated user");
                                                    });
                                                });
                                        }
                                    });
                            });
                        });

                });
        });
        app.post('/updateDisplay', function(req, res) {
            var uid = req.user._id;
            var newname = req.body.dname;
            var rp = [];
            var rq = [];
            var checking = [];
            console.log("_id:" + uid);
            User.findById(uid,
                function(err, user) {
                    if (err) throw err;
                    console.log(user);
                    user.profile.displayName = newname;
                    rq = getRQRSIdFromList(user.profile.requests);
                    rp = getRQRSIdFromList(user.profile.replies);
                    console.log(rq);
                    console.log(rp);
                    for (var kk = 0; kk < rq.length; kk++) {
                        Requests.findByIdAndUpdate(rq[kk], {
                            userName: newname
                        }, {
                            new: true
                        }, function(err, request) {
                            if (err) throw err;
                            console.log("request_updated");
                        });
                    }
                    for (var kk = 0; kk < rp.length; kk++) {
                        Requests.findById(rp[kk], function(err, request) {
                            for (var hh = 0; hh < request.Replies.length; hh++) {
                                if ((request.Replies[hh].userid + '') == (uid + '')) {
                                    console.log(request.Replies[hh].username);
                                    request.Replies[hh].username = newname;
                                }
                                request.save(function(err, request) {
                                    if (err) throw err;
                                    console.log("OOOOOOOKLA!")
                                });
                            }

                        });
                    }
                    user.save(function(err, user) {
                        if (err) throw err;
                        console.log("updated user");
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
            var keyword;
            var search;
            if (req.query.keyword) {
                search = "on";
                keyword = req.query.keyword;
            } else {
                search = "off";
                console.log("NOOOOOOO SEARCH");
            }
            console.log(keyword);
            Requests.find({}, function(err, request) {
                if (err) throw err;
                if (search == "on") {
                    var tmp = [];
                    for (var jj = 0; jj < request.length; jj++) {
                        if (request[jj].description.indexOf(keyword) >= 0 ||
                            request[jj].requestName.indexOf(keyword) >= 0 ||
                            request[jj].userName.indexOf(keyword) >= 0) {
                            tmp.push(request[jj]);
                        }
                    }
                    request = tmp;
                }
                console.log(request);
                //console.log("/requests/" + request[0]._id);

                var user;
                var status;
                if (req.isAuthenticated()) {
                    user = req.user;
                    status = "Login";
                } else {
                    user = req.user;
                    status = "Logout";
                }
                /*    console.log({
                        request: request,
                        user: user,
                        status: status
                    });*/
                res.render('request.ejs', {
                    request: request,
                    user: user,
                    status: status,
                    search: search,
                    keyword: keyword
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
                console.log(req.user);
                console.log(req.user.profile.replies);
                console.log(req.user.profile.requests);
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

function getRQRSIdFromList(listar) {
    var tmpar = [];
    for (var mm = 0; mm < listar.length; mm++) {
        tmpar.push(listar[mm].id);
    }
    return tmpar;
}
