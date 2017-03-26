var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');


var mongoose = require('mongoose');
User = mongoose.model('User');

function getUsers(req, res){
  var query = {};
  if (req.params.id) {
      query.userName = req.params.id;
  }

  User.find(query).then(data => {
      console.log(data);
      if(req.params.id){
      data = data[0];
    }
    res.json(data);
  }).fail(err => handleError(req, res, 500, err));
}

/*function addUser(req, res){
    console.log("adding user");
    var user = new User(req.body);
    var hash = bcrypt.hashSync(req.body.password, 10);
    user.password = hash;
    user.created_at = Date.now();
    user.updated_at = Date.now();
    user
        .save()
        .fail(err => handleError(req, res, 500, err));
}*/

function patchRFID(req, res){
    User.findOne({ 'userName' : req.params.id }, 'userName', function (err, user) {
        if (err) { handleError(req, res, 500, err); }

        user.rfid = req.body.rfid;
        user.updated_at = Date.now();

        user.save(function(err){
            if (err) {handleError(req, res, 500, err); }
            res.json(user);
        })
    });
}

function patchVideo(req, res){
    User.findOne({ 'userName' : req.params.id}, 'username', function (err, user) {
        if (err) { handleError(req, res, 500, err); }


    })
}

function deleteUser(req, res){
    User.remove({
        userName: req.params.id
    }, function(err, user){
        if (err) {handleError(req, res, 500, err); }
        res.json({ message: "User successfully deleted" });
    });
}

/* GET users listing. */
router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUsers)
    .delete(deleteUser);

router.route('/:id/rfid')
    .patch(patchRFID);

router.route('/:id/video')
    .patch(patchVideo);


module.exports = function (errCallback){
    console.log('Initializing users routing module');
    handleError = errCallback;
    return router;
}
