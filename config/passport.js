var LocalStrategy = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var Coach = require('../models/coach');

//var configAuth = require('./auth');

module.exports = function (passport) {

    // passport session setup
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // local registration
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, userName, password, done) {
            process.nextTick(function () {
                if (!req.user) {
                    User.findOne({'userName': userName}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'This username is already taken'));
                        } else {
                            var newUser = new User();
                            newUser.userName = userName;
                            newUser.password = newUser.generateHash(password);
                            newUser.firstName = req.body.firstName;
                            newUser.lastName = req.body.lastName;
                            newUser.email = req.body.email;
                            newUser.city = req.body.city;
                            newUser.dateOfBirth = req.body.dateOfBirth;

                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    var user = req.user;

                    user.userName = userName;
                    user.userName = user.generateHash(password);
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email;
                    user.city = req.body.city;
                    user.dateOfBirth = req.body.dateOfBirth;

                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }));

    // local login
    passport.use('local-login', new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            User.findOne({'userName': userName}, function (err, user) {
                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                return done(null, user);
            });
        }));

    passport.use('coach-local-signup', new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password',
        passReqToCallback: true
    },function (req, userName, password, done) {
        process.nextTick(function () {
            if (!req.coach) {
                Coach.findOne({'userName': userName}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'This email is already taken'));
                    } else {
                        var newCoach = new Coach();
                        newCoach.userName = userName;
                        newCoach.password = newCoach.generateHash(password);
                        newCoach.firstName = req.body.firstName;
                        newCoach.lastName = req.body.lastName;
                        newCoach.email = req.body.email;
                        newCoach.city = req.body.city;
                        newCoach.dateOfBirth = req.body.dateOfBirth;

                        newCoach.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newCoach);
                        });
                    }
                });
            } else {
                var coach = req.coach;

                coach.userName = userName;
                coach.userName = coach.generateHash(password);
                coach.firstName = req.body.firstName;
                coach.lastName = req.body.lastName;
                coach.email = req.body.email;
                coach.city = req.body.city;
                coach.dateOfBirth = req.body.dateOfBirth;

                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, coach);
                });
            }
        });
    }));

    passport.use('coach-local-login', new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            Coach.findOne({'userName': userName}, function (err, coach) {
                if (err)
                    return done(err);

                if (!coach)
                    return done(null, false, req.flash('loginMessage', 'No coach found.'));

                if (!coach.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                return done(null, user);
            });
        }));





    // facebook
    // passport.use(new FacebookStrategy({
    //         clientID: configAuth.facebookAuth.clientID,
    //         clientSecret: configAuth.facebookAuth.clientSecret,
    //         callbackURL: configAuth.facebookAuth.callbackURL,
    //         passReqToCallback: true,
    //         profileFields: ['id', 'emails', 'name']
    //     },
    //     function (req, token, refreshToken, profile, done) {
    //         process.nextTick(function () {
    //
    //             if (!req.user) {
    //                 User.findOne({'facebook.id': profile.id}, function (err, user) {
    //                     if (err)
    //                         return done(err);
    //
    //                     if (user) {
    //                         return done(null, user);
    //                     } else {
    //                         var newUser = new User();
    //                         newUser.facebook.id = profile.id;
    //                         newUser.facebook.token = token;
    //                         newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
    //                         newUser.facebook.email = profile.emails[0].value;
    //
    //                         newUser.save(function (err) {
    //                             if (err)
    //                                 throw err;
    //
    //                             return done(null, newUser);
    //                         });
    //                     }
    //                 });
    //             } else {
    //                 var user = req.user;
    //
    //                 user.facebook.id = profile.id;
    //                 user.facebook.token = token;
    //                 user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
    //                 user.facebook.email = profile.emails[0].value;
    //
    //                 user.save(function (err) {
    //                     if (err)
    //                         throw err;
    //                     return done(null, user);
    //                 });
    //             }
    //         });
    //     }));
};