var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
Coach = mongoose.model('Coach');
User = mongoose.model('User');
Invite = mongoose.model('Invites');


// add's an invite to a coach
function inviteCoach(req, res, next) {

    // check if user don't try to send himself an invite
    if (req.body.invited === req.body.invitor) {
        res.status(500).json({"error": "Can't invite yourself.."});
        return;
    }

    // find the coach (he is invited)
    User.findOne({email: req.body.invited}, function (err, invited) {
        if (!invited) {
            res.status(500).json({"error": "Email can't be found"});
            return
        }

        // find the user (he is the invitor)
        User.findOne({email: req.body.invitor}, function (err, invitor) {
            if (!invitor) {
                res.status(500).json({"error": "Email can't be found"});
                return
            }

            let invite = new Invite();// create a new invite
            invite.invitor = invitor; // set invitor (the user)
            invite.save().catch(err => handleError(req, res, 500, err));  // save the invite

            // add the invite to the coaches invites
            invited.invites.push(invite);

            // and save..
            invited.save().then(user => {
                res.status(201).json(user.invites)
            }).catch(err => handleError(req, res, 500, err));
        });
    });
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


function getCoaches(req, res) {
    var query = {};
    if (req.params.id) {
        query.userName = req.params.id;
        Coach.find(query)
            .populate('sporters')
            .then(data => {
                console.log(data);
                if (req.params.id) {
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
            }).fail(err => handleError(req, res, 500, err)
        );
    }
}

/**
 * Method to find coaches
 *
 * @param req
 * @param res
 */
function findCoach(req, res) {

    var query = {
        $or: [
            {userName: {$regex: req.params.query, $options: 'i'}},
            {lastName: {$regex: req.params.query, $options: 'i'}},
            {city: {$regex: req.params.query, $options: 'i'}},
        ],
    };

    User.find(query)
        .then(data => {
            res.status(200).json(data);
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

function patchSporter(req, res) {
    var sporter;
    User.findOne({'userName': req.body.sporter}, 'userName', function (err, user) {
        sporter = new User(user);
        console.log(sporter);
        console.log(user);
    });
    Coach.findOne({'userName': req.params.id}, 'userName', function (err, coach) {
        if (err) {
            handleError(req, res, 500, err);
        }
        if (coach.sporters === null) {
            var array = [sporter._id];
            coach.sporters = array;
        } else {
            coach.sporters.push(sporter._id);
        }
        coach.updated_at = Date.now();

        coach.save(function (err) {
            if (err) {
                handleError(req, res, 500, err);
            }
            res.json(coach);
        });
    });
}

function deleteCoach(req, res) {
    Coach.remove({
        userName: req.params.id
    }, function (err, user) {
        if (err) {
            handleError(req, res, 500, err);
        }
        res.json({message: "Coach successfully deleted"});
    });
}

router.route('/invite')
    .post(inviteCoach);

/* GET coachs listing. */
router.route('/')
    .get(getCoaches);

router.route('/find/:query')
    .get(findCoach);

router.route('/:id')
    .get(getCoaches)
    .delete(deleteCoach);

router.route('/:id/sporter')
    .patch(patchSporter);

module.exports = function (errCallback) {
    console.log('Initializing coaches routing module');
    handleError = errCallback;
    return router;
};
