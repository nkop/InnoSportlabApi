var express = require('express');
var router = express();
var handleError;
var async = require('async');

var mongoose = require('mongoose');
User = mongoose.model('User');
Video = mongoose.model('Video');

function getUsers(req, res) {
    var query = {};

    console.log(req.params.id);

    if (req.params.id) {
        query._id = req.params.id;
    }

    User.find(query).populate("sporters").then(data => {
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function patchRFID(req, res) {
    User.findOne({'userName': req.params.userName}, 'userName', function (err, user) {
        if (err) {
            handleError(req, res, 500, err);
        }

        user.rfid = req.body.rfid;
        user.save(function (err) {
            if (err) {
                handleError(req, res, 500, err);
            }
            res.json(user);
        })
    });
}

function deleteUser(req, res) {
    User.remove({
        userName: req.params.userName
    }, function (err) {
        if (err) {
            handleError(req, res, 500, err);
        }
        res.json({message: "User successfully deleted"});
    });
}

function updateUser(req, res) {
    User.findById(req.params.userName, function (err, user) {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.city = req.body.city;
        user.rfid = req.body.rfid;
        user.save()
            .then(user => {
                res.status(200).json(user)
            }).catch(err => handleError(req, res, 500, err));
    });
}

function validateLogin(req, res) {
    User.findOne({'email': req.body.email}, function (err, user) {
        if (err)
            console.log("error");

        if (!user || !user.validPassword(req.body.password)) {
            res.status(500)
                .json({
                    "message": "Invalid email or password"
                });
        } else {
            return res.status(200).json(user);
        }
    });
}

function addUser(req, res) {
    var user = new User(req.body);
    user.password = user.generateHash(req.body.password);
    user.save()
        .then(user => {
            res.status(201).json(user);
        })
        .fail(err => handleError(req, res, 500, err));
}

function validateSignUp(req, res) {

  var countPasswordChar = Object.keys(req.body.password).length;

  if (req.body.password === req.body.confirmpassword && countPasswordChar > 5) {
    User.findOne({'userName': req.body.userName}, function (err, user) {
        if (err)
            handleError(req, res, 500, err);

        if(user === null){
          User.findOne({'email': req.body.email}, function (err, user) {
            if(user === null){
              addUser(req,res);
            } else {
                res.status(500).json({"message" : "Email already exists"});
            }
          });

        } else {
          res.status(500).json({"message" : "Username already exists"});
        }

    });
  }
  else if (countPasswordChar < 6){
    res.status(500).json({"message" : "Passwords characters must be at least contain 6 characters"});
  }
  else {
    res.status(500).json({"message" : "Passwords does not match"});
  }
}

function getVideos(req, res)
{
    var query = {};
    if (req.params.id) {
        query.sporter = req.params.id;
    }

    Video.find(query).then(data => {
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUsers);

router.route('/:userName')
    .get(getUsers)
    .put(updateUser)
    .delete(deleteUser);

router.route('/:userName/rfid')
    .patch(patchRFID);

router.route('/:id/videos')
    .get(getVideos);  

router.route('/validate')
    .post(validateLogin);

router.route('/validatesignup')
    .post(validateSignUp);

module.exports = function (errCallback) {
    console.log('Initializing users routing module');
    handleError = errCallback;
    return router;
};
