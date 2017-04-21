var express = require('express');
var router = express();
var passport = require('passport');
var handleError;

var mongoose = require('mongoose');
User = mongoose.model('User');


function getUsers(req, res) {
    User.find({}).then(data => {
        res.json(data);
    });
}

function deleteUsers(req, res) {
    User.remove({}, function (err, data) {
        res.status(200);
    });
}

function renderLogin(req, res, next) {
    res.render('login', {message: req.flash('loginMessage')});
}

function renderSignup(req, res, next) {
    res.render('signup', {message: req.flash('signupMessage')});
}

function logout(req, res) {
    req.logout();
    res.redirect('/');
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

router.route('/signup')
    .get(renderSignup)
    .post(passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/auth/signup',
        failureFlash: true
    }));

router.route('/login')
    .get(renderLogin)
    // .post(passport.authenticate('local-login', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/auth/login',
    //     failureFlash: true
    // }));
    .post(function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (user) {
                res.json(user);
            } else {
                res.json({"message": "failure"});
            }
        })(req, res, next);
    });


router.route('/logout')
    .get(logout);

router.route('/get')
    .get(getUsers)
    .delete(deleteUsers);

module.exports = function (errCallback) {
    console.log('Initializing authentication routing module');
    handleError = errCallback;
    return router;
};