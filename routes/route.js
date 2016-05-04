/**
 * main routing
 * Created by tcheng on 3/21/16.
 */
var User = require('../models/user');
var Requests = require('../models/request');

module.exports = {
    //pass in middleware for authentication status
    authenticate: function(app, passport) {
        //index page
        app.get('/', function(req, res) {
            var user;
            var status;
            //if user is authenicated checking
            //different render would be processed by the ejs file
            if (req.isAuthenticated()) {
                user = req.user;
                status = "Login";
            } else {
                user = req.user;
                status = "Logout";
            }
            //ejs index.ejs render
            res.render('index', {
                title: 'Homepage',
                user: user,
                status: status
            });
        });

        //about us render
        app.get('/aboutus', function(req, res) {
            res.render('about_us.ejs', {
                user: req.user
            });
        });

        //render form.ejs
        app.get('/request', isLoggedIn, function(req, res) {
            res.render('form', {
                user: req.user
            });
        });

        //when user post a new request through ajax
        app.post('/request', isLoggedIn, function(req, res, next) {
            if (req.xhr || req.accepts('json,html') === 'json') {
                if (req.body.title) {
                    //create the request
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
                            //console.log('request created!');
                            //console.log(req.user.profile.requests);
                            var newreq = {
                                id: request._id,
                                title: request.requestName
                            }
                            var cost = request.Token;
                            //token requested should be deducted and hold from user account
                            User.findById(req.user._id, function(err, u) {
                                //console.log(Session[0])
                                if (err) {}
                                //console.log(u);
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

        //when user reply to a request
        app.post('/reply', isLoggedIn, function(req, res) {
            //update the request with the correcpoding user that replied to the request
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    if (err) throw err;
                    //push the new reply into user array
                    request.Replies.push({
                        userid: req.user._id,
                        username: req.user.profile.displayName
                    });
                    request.save(function(err, request) {
                        if (err) throw err;
                        console.log('Updated reply!');
                    });
                });
            //at the same time update the user database with the requests the user replied to
            User.findById(req.user._id,
                function(err, user) {
                    if (err) throw err;
                    //console.log(user);
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

        //when user post to cancel the reply
        app.post('/replied', isLoggedIn, function(req, res) {
            // the user should be removed from the request list
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    if (err) throw err;
                    var tmp = request.Replies;
                    request.Replies = tmp.filter(function(e) {
                        return e.userid !== req.user._id + '';
                    });
                    //console.log(request.Replies);
                    request.save(function(err, request) {
                        if (err) throw err;

                    });
                });
            //the request should be removed from the reply list of the user
            User.findById(req.user._id,
                function(err, user) {
                    if (err) throw err;
                    //console.log(user);
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

        //when the request is deleted
        app.post('/deleteRequest', isLoggedIn, function(req, res) {
            var userwith = [];
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    //console.log(request);
                    var token = request.Token;
                    if (err) throw err;
                    //the list of replier should be saved for later process
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    var owner = request.userID;
                    //the request should be removed from the owner of the request
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            //the token should be return back to the user
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                        //for each of the user that has the request in their reply
                        //has to be removed
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
                    //finally the request itself is removed
                    Requests.findByIdAndRemove(req.body.requestId, function(err, resp) {
                        if (err) throw err;
                        console.log("deleted request");
                    });

                });
        });

        //when the request is completed
        app.post('/completeRequest', isLoggedIn, function(req, res) {
            var userwith = [];
            var completeUser = req.body.userId;
            Requests.findById(
                req.body.requestId,
                function(err, request) {
                    //console.log(request);
                    //save the token for future use
                    var token = request.Token;
                    if (err) throw err;
                    //save user that replied the the request
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    //save the owner of the request
                    var owner = request.userID;
                    //remove the request from the owner
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                    //find the user that completed the task
                    //remove the task from the reply list
                    //update the token of the user
                    User.findById(completeUser,
                        function(err, user) {
                            if (err) throw err;
                            //console.log(user.profile.replies);
                            var tmp = user.profile.requests;
                            user.profile.requests = tmp.filter(function(e) {
                                return e.id !== req.body.requestId;
                            });
                            var current = user.profile.tokens;
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                        });
                    //for other non-selected user of the requestId
                    //remove the request from the reply list for the users
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
                    //finally remove the request
                    Requests.findByIdAndRemove(req.body.requestId, function(err, resp) {
                        if (err) throw err;
                        console.log("deleted request");
                    });

                });
        });

        //display the request page
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
                        //check if the user is the owner of the request
                        for (var n = 0; n < req.user.profile.requests.length; n++) {
                            if (req.user.profile.requests[n].id == req.params.requestId) {
                                //console.log("found!");
                                renderfile = 'request_user.ejs' //render the request_user.ejs instead of public version
                                break;
                            }
                        }
                        //check if the user if not owner has replied to the request
                        for (var n = 0; n < req.user.profile.replies.length; n++) {
                            if (req.user.profile.replies[n].id == req.params.requestId){
                                //console.log("hasreplied");
                            replyStat = true;}
                        }

                    }
                    res.render(renderfile, {
                        request: request,
                        user: user,
                        status: status,
                        replyStat: replyStat
                    });
                });
        });

        //when a user is selected to complete a task
        app.post('/confirmtask', isLoggedIn, function(req, res) {
            //console.log(req.body);
            var oldActive;
            Requests.findById(req.body.requestId, function(err, request) {
                if (err) throw err;
                //console.log(request);
                //check within the request
                for (var j = 0; j < request.Replies.length; j++) {
                    //if found the selected candidate, change the status to active
                    if ((request.Replies[j].userid + '') === (req.body.userId + '')) {
                        request.Replies[j].status = "active";
                    } else {
                        //if there's another candidate that is active, change it back to pending
                        if (request.Replies[j].status = "active") {
                            oldActive = request.Replies[j].userid
                        }
                        request.Replies[j].status = "pending";
                    }
                    //console.log(request)
                    request.save(function(err, request) {
                        if (err) throw err;
                        console.log("updated");
                    });
                }
                //update the status of the slected user to active
                User.findById(req.body.userId, function(err, user) {
                    if (err) throw err;
                    for (var j = 0; j < user.profile.replies.length; j++) {
                        if ((user.profile.replies[j].id + '') == (req.body.requestId + '')) {
                            user.profile.replies[j].status = "active";
                        }
                        user.save(function(err, user) {
                            if (err) throw err;
                            console.log("updated owner");
                        });

                    }
                    //if there exist a previous selected candidate
                    //change the active status back to pending
                    if (!!oldActive) {
                        User.findById(oldActive, function(err, user) {
                            if (err) throw err;
                            //console.log(user);
                            for (var j = 0; j < user.profile.replies.length; j++) {
                                if ((user.profile.replies[j].id + '') == (req.body.requestId + '')) {
                                    user.profile.replies[j].status = "pending";
                                }
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

        //render the page for edit request
        app.get('/update/request/:updaterequestId', isLoggedIn, function(req, res, next) {
            console.log(req.params.updaterequestId);
            Requests.findById(
                req.params.updaterequestId,
                function(err, request) {
                    //console.log(request);
                    if (err) {
                        return next(new Error());
                    }
                    var user = req.user;
                    var status = "Login";
                    var renderfile = 'updateform.ejs';
                    //if not the owner of the request, redirect to error page
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

        //post update from a request update
        app.post('/update/request/:updaterequestId', isLoggedIn, function(req, res) {
            var userwith = [];
            Requests.findById(
                req.params.updaterequestId,
                function(err, request) {
                    //console.log(request);
                    //get the old token for later use
                    var token = request.Token;
                    if (err) throw err;
                    //get all user that replied to the request
                    for (var m = 0; m < request.Replies.length; m++) {
                        userwith.push(request.Replies[m].userid);
                    }
                    //get the owner of the request
                    var owner = request.userID;
                    //find the owner of the request
                    User.findById(owner,
                        function(err, user) {
                            if (err) throw err;
                            var tmp = user.profile.requests;
                            //remove the current request
                            user.profile.requests = tmp.filter(function(e) {
                                return e.id !== req.params.updaterequestId;
                            });
                            //return the hold token
                            var current = user.profile.tokens;
                            user.profile.tokens = parseInt(current) + parseInt(token);
                            user.save(function(err, user) {
                                if (err) throw err;
                                console.log("updated owner");
                            });
                            //find the request to update and update the new data
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
                                        //check if there is a active user in the reply list
                                        //save it for later use
                                        activeuser = request.Replies[j].userid;
                                    }
                                }
                                //find the owner and push a new request
                                User.findById(owner,
                                    function(err, user) {
                                        if (err) throw err;
                                        user.profile.requests.push({
                                            id: req.params.updaterequestId,
                                            title: req.body.title
                                        });
                                        //new amount of token to be hold
                                        var current = user.profile.tokens;
                                        user.profile.tokens = parseInt(current) - parseInt(req.body.token);

                                        user.save(function(err, user) {
                                            if (err) throw err;
                                            console.log("updated owner");
                                        });

                                        //for every user, remove the previous reply data
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
                                        //make sure the pending or active status remain the same
                                        //update the new data for each replied user
                                        for (var m = 0; m < userwith.length; m++) {
                                            User.findById(userwith[m],
                                                function(err, user) {
                                                    if (err) throw err;
                                                    status = "pending"
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

        //update user Display name
        app.post('/updateDisplay', function(req, res) {
            var uid = req.user._id;
            var newname = req.body.dname;
            var rp = [];
            var rq = [];
            var checking = [];
            //console.log("_id:" + uid);
            User.findById(uid,
                function(err, user) {
                    if (err) throw err;
                    //console.log(user);
                    //retrieve all the requests and replies the user has made
                    user.profile.displayName = newname;
                    rq = getRQRSIdFromList(user.profile.requests);
                    rp = getRQRSIdFromList(user.profile.replies);
                    //console.log(rq);
                    //console.log(rp);
                    //update the username for every request
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
                        //update the username for every reply
                        Requests.findById(rp[kk], function(err, request) {
                            for (var hh = 0; hh < request.Replies.length; hh++) {
                                if ((request.Replies[hh].userid + '') == (uid + '')) {
                                    //console.log(request.Replies[hh].username);
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

        //get login page
        app.get('/login', function(req, res) {
            res.render('login.ejs', {
                message: req.flash('loginMessage')
            });
        });

        //get request page
        app.get('/requests', function(req, res, next) {
            var keyword;
            var search;
            if (req.query.keyword) {
                search = "on";
                keyword = req.query.keyword;
            } else {
                search = "off";
                //console.log("NOOOOOOO SEARCH");
            }
            //console.log(keyword);
            //search function using findall
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
                //console.log(request);
                //console.log("/requests/" + request[0]._id);
                //check if the current user is logged in
                var user;
                var status;
                if (req.isAuthenticated()) {
                    user = req.user;
                    status = "Login";
                } else {
                    user = req.user;
                    status = "Logout";
                }
                    console.log({
                        request: request,
                        user: user,
                        status: status
                    });
                res.render('request.ejs', {
                    request: request,
                    user: user,
                    status: status,
                    search: search,
                    keyword: keyword
                });
            });
        });

        //post a login
        app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));

        //render the signup page
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', {
                message: req.flash('signupMessage')
            });
            console.log("here!");
        });

        //post the signup data
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/profile',
            failureRedirect: '/signup',
            failureFlash: true
        }));


        //retrieve the user profile
        app.get('/profile', isLoggedIn, function(req, res) {
            User.find({
                "local.email": req.user.local.email
            }, function(err, docs) {
                //console.log("====")
                res.render('user.ejs', {
                    user: req.user
                });
            });
        });

        //logout and redirect to homepage
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

//get the request and reply from the list of given array
function getRQRSIdFromList(listar) {
    var tmpar = [];
    for (var mm = 0; mm < listar.length; mm++) {
        tmpar.push(listar[mm].id);
    }
    return tmpar;
}
