/**
 * Created by tcheng on 3/21/16.
 * Passport.js offers the middleware for authentication across this application,
 * It will authenticate users name and password and return the vadility of user
 * The module uses two import statements includeing the LocalStrategy function
 * provided by the npm package of passport.
 * The imported User provides the user data schema to passport
 */


var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/user');

module.exports = function (passport) {
    //provide the user a unique cookie with id
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    //find the user cookie id and destroy it
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    //make use of the local strategy for users that uses username and password
    //to login to do signup
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password,  done) {
            //function takes in email and password parameters from user's request
            process.nextTick(function () {
                User.findOne({'local.email': email}, function (err, user) {
                    //check if the email is registered and return flash message
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken'));
                    } else {
                        //register a new user using the user data schema
                        var newUser            = new User();
                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.profile.displayName = req.body.displayName
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
    //make use of the local strategy for users that uses username and password
    //to login to do login
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        password : 'password',
        passReqToCallback : true
    },

    function(req, email, password, done){
        User.findOne({'local.email' : email},function (err, user) {
            if (err) {
                return done(err);
            }
            //check if the user's email exist
            if(!user){
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }
            //check if the user's password is correct
            //function validPassword is decleared and encapsulated in the user's module
            if(!user.validPassword(password)){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password.'));
            }
            return done(null, user);
        });
    }));

};
