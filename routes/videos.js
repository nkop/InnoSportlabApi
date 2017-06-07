/**
 * Created by Niels on 2-3-2017.
 */

var express = require('express');
var router = express();
var _ = require('underscore');
var multer = require('multer');
var Grid = require('gridfs-stream');
var GridFsStorage = require('multer-gridfs-storage');
var handleError;

var mongoose = require('mongoose');
Video = mongoose.model('Video');
Tag = mongoose.model('Tag');
User = mongoose.model('User');

var conn = mongoose.connection;

Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

function getVideos(req, res){
    console.log(req.params.id);
    var query = {};
    if (req.params.id) {
        query._id = req.params.id;
    }
    console.log(query);

    Video.find(query).then(data => {
        console.log(data);
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addVideo(req, res) {
    console.log(req.body.sporter);
    User.findOne({ 'userName' : req.body.sporter }, function (err, user) {
        console.log(user);
        var video = new Video();
        video.sporter = user;
        video.save()
            .then(video => {
                console.log(video);
                console.log(res.json());
                upload(req, res, function(err) {
                    if (err)
                        handleError(req, res, 500, err);
                    res.status(201).json(video);
                });
            })
            .fail(err => handleError(req, res, 500, err));
    });
}

/*function addVideo(req, res){
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
}*/

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

/*function addSingleVideo(req, res) {
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
}*/

function deleteVideo(req, res){
    Video.remove({
        _id: req.params.id
    }, function(err, user){
        if (err) {handleError(req, res, 500, err); }
        res.json({ message: "Video successfully deleted" });
    });
}

var storage = GridFsStorage({
    gfs : gfs,
    filename: function (req, file, cb) {
        var datetimestamp = Math.round(Date.now()/1000);
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    },
    /** With gridfs we can store additional meta-data along with the file */
    metadata: function(req, file, cb, res) {
        cb(null,
            {   originalname: file.originalname,
                videoId: res.json().id
            });
    },
    root: 'ctFiles' //root name for collection to store files into
});

var upload = multer({ //multer settings for single upload
    storage: storage
}).single('file');

function uploadVideo(req, res, video){

    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json();
    });
}

function getVideo(req, res){
    gfs.collection('ctFiles'); //set collection name to lookup into

    /** First check if file exists */
    gfs.files.find({'metadata.videoId': req.params.id}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        /** create read stream */
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
            root: "ctFiles"
        });
        /** set the proper content type */
        res.set('Content-Type', files[0].contentType)
        /** return response */
        return readstream.pipe(res);
    });
}


/* GET videos listing. */
router.route('/')
    .get(getVideos)
    .post(addVideo);

router.route('/:id')
    .get(getVideos)
    .delete(deleteVideo);

router.route('/:id/video')
    .get(getVideo);

module.exports = function (errCallback){
    console.log('Initializing video routing module');
    handleError = errCallback;
    return router;
}
