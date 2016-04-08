/**
 * Created by tcheng on 3/21/16.
 */


var User = require('../models/user');

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

        app.get('/form_request', isLoggedIn, function(req, res) {
            res.render('form_request.ejs', {
                user: req.user
            });
        });

        app.get('/form_volunteer', isLoggedIn, function(req, res) {
            res.render('form_volunteer.ejs', {
                user: req.user
            });
        });


        //login--get//
        app.get('/login', function(req, res) {
            res.render('login.ejs', {
                message: req.flash('loginMessage')
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
                console.log("====")
                console.log(docs);  
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
