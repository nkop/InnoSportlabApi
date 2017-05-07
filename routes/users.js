var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');


var mongoose = require('mongoose');
User = mongoose.model('User');

function getUsers(req, res) {
    var query = {};
    if (req.params.id) {
        query.userName = req.params.id;
    }

    User.find(query).then(data => {
        console.log(data);
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addUser(req, res) {
    var user = new User(req.body);
    user.password = user.generateHash(req.body.password);
    user
        .save()
        .then(user => {
            res.status(201).json(user);
        })
        .fail(err => handleError(req, res, 500, err));
}

function patchRFID(req, res) {
    User.findOne({'userName': req.params.id}, 'userName', function (err, user) {
        if (err) {
            handleError(req, res, 500, err);
        }

        user.rfid = req.body.rfid;
        user.updated_at = Date.now();

        user.save(function (err) {
            if (err) {
                handleError(req, res, 500, err);
            }
            res.json(user);
        })
    });
}

function patchVideo(req, res) {
    User.findOne({'userName': req.params.id}, 'username', function (err, user) {
        if (err) {
            handleError(req, res, 500, err);
        }


    })
}

function deleteUser(req, res) {
    User.remove({
        userName: req.params.id
    }, function (err, user) {
        if (err) {
            handleError(req, res, 500, err);
        }
        res.json({message: "User successfully deleted"});
    });
}

function updateUser(req, res) {
    User.findById(req.params.id, function (err, user) {
        // user.userName = req.body.userName; // todo check if alrady exists
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.city = req.body.city;
        user.rfid = req.body.rfid;
        user
            .save()
            .then(user => {
                res.status(200).json(user)
            }).catch(err => handleError(req, res, 500, err));
    });
}

/**
 * Check if user/email exists and if password matches
 * @param req
 * @param res
 */
function validateLogin(req, res) {
    User.findOne({'email': req.body.email}, function (err, user) {
        console.log(user);
        if (err)
            console.log("error");

        if (!user || !user.validPassword(req.body.password)) {
            res
                .status(500)
                .json({
                    "message": "Invalid email or password"
                });
        } else {
            return res.status(200).json(user);
        }
    });
}

function validateSignUp(req, res) {
  if (req.body.password === req.body.confirmpassword) {
    User.findOne({'userName': req.body.userName}, function (err, user) { // deze user moet niet null zijn nu
        console.log(user);
        if (err)
            console.log("error");

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
  else {
    res.status(500).json({"message" : "Passwords does not match"});
  }
}

function getCoaches(req,res) {
    console.log("insinde");
    res.status(200).json({"test" : "test"});
}

/* GET users listing. */
router.route('/')
    .get(getUsers)
    .post(addUser);

router.route('/:id')
    .get(getUsers)
    .put(updateUser)
    .delete(deleteUser);

router.route('/:id/rfid')
    .patch(patchRFID);

router.route('/:id/video')
    .patch(patchVideo);

router.route('/validate')
    .post(validateLogin);

router.route('/validatesignup')
    .post(validateSignUp);




module.exports = function (errCallback) {
    console.log('Initializing users routing module');
    handleError = errCallback;
    return router;
};
