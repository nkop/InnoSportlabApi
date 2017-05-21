/**
 * Created by Niels on 2-3-2017.
 */

var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;

var mongoose = require('mongoose');
Video = mongoose.model('Video');
Tag = mongoose.model('Tag');
User = mongoose.model('User');

function getVideos(req, res){
    var query = {};
    if (req.params.id) {
        query.userName = req.params.id;
    }

    Video.find(query).then(data => {
        console.log(data);
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addVideo(req, res){
    var fail = null;
    for (var reqVideo in req.body.video){
        video.filePath = reqVideo.filePath;
        var video = new Video();
        if (reqVideo.tags != null) video.tags = reqVideo.tags;
        video.save()
            .fail(fail = err);
        userPatchVideo(reqVideo.userName, video);

    }
    if (fail != null) handleError(req, res, 500, fail);
}

function userPatchVideo(userName, video){
    User.findOne({ 'userName' : userName }, 'userName', function (err, user) {
        if (err) { handleError(req, res, 500, err); }

        if (user.videos == null) {
            var array = [video._id];
            user.videos = array;
        } else {
            user.videos.push(video._id);
        }
        user.updated_at = Date.now();

        user.save(function(err){
            if (err) {handleError(req, res, 500, err); }
            res.json(user);
        })
    });
}

/*function patchSporter(req, res){
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
}*/

function addSingleVideo(req, res) {
    User.findOne({ 'userName' : req.body.sporter }, function (err, user) {
        console.log(user);
        var video = new Video();
        video.filePath = req.body.filePath;
        video.sporter = user;
        video
            .save()
            .then(video => {
                res.status(201).json(video);
            })
            .fail(err => handleError(req, res, 500, err));  
    });   
}

function deleteVideo(req, res){
    Video.remove({
        _id: req.params.id
    }, function(err, user){
        if (err) {handleError(req, res, 500, err); }
        res.json({ message: "Video successfully deleted" });
    });
}

/* GET videos listing. */
router.route('/')
    .get(getVideos)
    .post(addSingleVideo);

router.route('/:id')
    .get(getVideos)
    .delete(deleteVideo);

/*router.route('/:id/sporter')
    .patch(patchSporter);*/

module.exports = function (errCallback){
    console.log('Initializing video routing module');
    handleError = errCallback;
    return router;
}
