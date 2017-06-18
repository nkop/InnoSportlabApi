var express = require('express');
var router = express();
var handleError;
var async = require('async');

var mongoose = require('mongoose');
User = mongoose.model('User');
Message = mongoose.model('Message');

function getMessages(req, res) {
    User.findOne({ '_id' : req.params.id }, function (err, user) {
        Message.find({ '_id' : { $in: user.messages }  }, function (err, data) {
            res.json(data);
        })
        .populate('invitor');
    });
}

function getSingleMessage(req, res) {
    Message.findById(req.params.id)
        .populate("invitor")
        .then(data => {
            res.json(data);
        }).catch(err => handleError(req, res, 500, err));
}

function inviteCoach(req, res) {
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

            let message = new Message();// create a new invite
            message.invitor = invitor; // set invitor (the user)
            message.message = "You have received an invitation from.";
            message.type = req.body.type;
            message.save().catch(err => handleError(req, res, 500, err));  // save the invite
            invited.messages.push(message);

            invited.save().then(user => {
                res.status(201).json(user.messages)
            }).catch(err => handleError(req, res, 500, err));
        });
    });
}

function acceptInvite(req, res) {
    Message.findOne({_id: req.body.id}, function (err, message) {
        User.findOne({_id: req.body.userId}, function (err, user) {
            if (!user) {
                res.status(500).json({"error": "User can't be found"});
                return
            }

            let sporterId = message.invitor;

            user.sporters.push(sporterId);
            user.save().catch(error => handleError(req, res, 500, err));

            message.read = true;
            message.accepted = true;
            message.save().then(() => {
                res.json({"message": "Invite has been accepted"})
            }).catch(error => handleError(req, res, 500, err));
        });
    });
}

function declineInvite(req, res) {
    Message.findOne({_id: req.body.id}, function (err, message) {
        message.read = true;
        message.accepted = false;
        message.save().then(() => {
            res.json({"message": "Invite has been declined"})
        }).catch(error => handleError(req, res, 500, err));
    });
}

router.route('/invite')
    .post(inviteCoach);

router.route('/:id')
    .get(getMessages);

router.route('/:id/single')
    .get(getSingleMessage);

router.route('/:id/accept')
    .post(acceptInvite);

router.route('/:id/decline')
    .post(declineInvite);

module.exports = function (errCallback) {
    console.log('Initializing coaches routing module');
    handleError = errCallback;
    return router;
};
