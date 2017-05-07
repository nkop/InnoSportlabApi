var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
Coach = mongoose.model('Coach');
User = mongoose.model('User');

function getCoaches(req, res){
    var query = {};
    if (req.params.id) {
        query.userName = req.params.id;
        Coach.find(query)
            .populate('sporters')
            .then(data => {
            console.log(data);
        if(req.params.id){
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
    } else {
        Coach.find(query)
            .then(data => {
            console.log(data);
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).
        fail(err => handleError(req, res, 500, err)
    );}
}

function findCoach(req,res) {

    User.find({'userName' : new RegExp(req.params.username, 'i')}, function(err, docs){
        res.status(200).json(docs);
    });

}

/*function addCoach(req, res){
    console.log("adding coach");
    var coach = new Coach(req.body);
    var hash = bcrypt.hashSync(req.body.password, 10);
    coach.password = hash;
    coach.created_at = Date.now();
    coach.updated_at = Date.now();
    coach
        .save()
        .fail(err => handleError(req, res, 500, err));
}*/

function patchSporter(req, res){
    var sporter;
    User.findOne({ 'userName' : req.body.sporter }, 'userName', function (err, user) {
        sporter = new User(user);
        console.log(sporter);
        console.log(user);
    });
    Coach.findOne({ 'userName' : req.params.id }, 'userName', function (err, coach) {
        if (err) { handleError(req, res, 500, err); }
        if (coach.sporters == null) {
            var array = [sporter._id];
            coach.sporters = array;
        } else {
            coach.sporters.push(sporter._id);
        }
        coach.updated_at = Date.now();

        coach.save(function(err){
            if (err) {handleError(req, res, 500, err); }
            res.json(coach);
        })
    });
}

function deleteCoach(req, res){
    Coach.remove({
        userName: req.params.id
    }, function(err, user){
        if (err) {handleError(req, res, 500, err); }
        res.json({ message: "Coach successfully deleted" });
    });
}

/* GET coachs listing. */
router.route('/')
    .get(getCoaches);

router.route('/find/:username')
    .get(findCoach);

router.route('/:id')
    .get(getCoaches)
    .delete(deleteCoach);

router.route('/:id/sporter')
    .patch(patchSporter);

module.exports = function (errCallback){
    console.log('Initializing coaches routing module');
    handleError = errCallback;
    return router;
}
