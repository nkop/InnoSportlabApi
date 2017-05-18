var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
User = mongoose.model('User');
Message = mongoose.model('Message');

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

            let message = new Message();// create a new invite
            message.invitor = invitor; // set invitor (the user)
            message.message = "You have received an invitation.";
            message.type = req.body.type;
            message.save().catch(err => handleError(req, res, 500, err));  // save the invite

            // add the invite to the coaches invites
            invited.messages.push(message);

            // and save..
            invited.save().then(user => {
                res.status(201).json(user.messages)
            }).catch(err => handleError(req, res, 500, err));
        });
    });
}

function getMessages(req, res) {
    User.findById(req.params.id)
        .populate("messages")
        .then(data => {
            res.json(data.messages)
        })
        .catch(err => handleError(req, res, 500, err));
}

function getSingleMessage(req, res) {
    Message.findById(req.params.id)
        .populate("invitor")
        .then(data => {
            res.json(data);
        }).catch(err => handleError(req, res, 500, err));
}

router.route('/invite')
    .post(inviteCoach);

router.route('/:id')
    .get(getMessages);

router.route('/:id/single')
    .get(getSingleMessage);

module.exports = function (errCallback) {
    console.log('Initializing coaches routing module');
    handleError = errCallback;
    return router;
};