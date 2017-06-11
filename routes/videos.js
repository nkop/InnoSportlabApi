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
var vid;

var testStorage = GridFsStorage({
    gfs: gfs,
    filename: function(req, file, cb) {
        cb(null, vid._id);
    }
});

var testUpload = multer({ storage: testStorage });

function getVideos(req, res){
    console.log(req.params.id);
    var query = {};
    if (req.params.id) {
        query._id = req.params.id;
    }
    console.log(query);

    Video.find(query).populate('tags').then(data => {
        console.log(data);
        if (req.params.id) {
            data = data[0];
        }
        res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addVideo(req, res) {
    console.log(req.files);
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        var video = new Video();
        video.sporter = user;
        video.save()
            .then(video => {
                vid = video;
                console.log(vid);
                upload(req, res, function(err) {
                    if (err)
                        handleError(req, res, 500, err);
                });
                res.status(201).json(video);
             })
            .fail(err => handleError(req, res, 500, err));
    });
}
var sUpload = testUpload.single('file');

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
        console.log(file);
        cb(null, vid._id);
    },
    /** With gridfs we can store additional meta-data along with the file */
    metadata: function(req, file, cb) {
        console.log(vid);
        cb(null,
            {   originalname: file.originalname,
                videoId: vid._id
            });
    },
    root: 'ctFiles' //root name for collection to store files into
});

var upload = multer({ //multer settings for single upload
    storage: storage
}).single('file');



function getVideo(req, res){
    gfs.collection('ctFiles'); //set collection name to lookup into
    Video.findOne({'_id': req.params.id }, function(err, video) {
        if(video != null) {
            gfs.files.find({'filename': video._id}).toArray(function (err, files) {
                if (!files || files.length === 0) {
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
    })

}


/* GET videos listing. */
router.route('/')
    .get(getVideos)

router.route('/:id')
    .get(getVideos)
    .delete(deleteVideo);

router.route('/:username')
    .post(addVideo)

router.route('/:id/video')
    .get(getVideo);

module.exports = function (errCallback){
    console.log('Initializing video routing module');
    handleError = errCallback;
    return router;
}
