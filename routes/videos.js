var express = require('express');
var router = express();
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

function getVideos(req, res){
    var query = {};
    if (req.params.id) {
        query._id = req.params.id;
    }

    Video.find(query)
        .populate('tags')
        .populate('comments')
        .populate('sporter')
        .then(data => {
            if (req.params.id) {
                data = data[0];
            }
            res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addVideo(req, res) {
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        var video = new Video();
        video.sporter = user;
        video.save(function(err){
            vid = video;
            if (err) return handleError(err);
            upload(req, res, function (err) {
                if (err) {
                    handleError(req, res, 500, err);
                } else {
                    res.json(vid);
                }
            });
        });
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

var storage = GridFsStorage({
    gfs: gfs,
    root: 'ctFiles',
    filename: function (req, file, cb) {
        cb(null, vid._id);
    },
    log: function(err, log) {
        console.log('storage');
         if (err) {
             console.error(err);
         } else {
             console.log(log.message, log.extra);
         }
    }
});

var upload = multer({
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
                var readstream = gfs.createReadStream({
                    filename: files[0].filename,
                    root: "ctFiles"
                });
                res.set('Content-Type', files[0].contentType)
                return readstream.pipe(res);
            });
        }
    })

}

function favorite(req, res) {
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        user.favoriteVideos.push(req.params.id);
        user.save(function (err) {
            if (err) {
                handleError(req, res, 500, err);
            }
            res.json(user);
        })
    });
}

function unfavorite(req, res) {
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        var index = user.favoriteVideos.indexOf(req.params.id);
        if (index > -1) {
            user.favoriteVideos.splice(index, 1);
        }
        user.save(function (err) {
            if (err) {
                handleError(req, res, 500, err);
            }
            res.json(user);
        })
    });
}

function getFavoriteVideos(req, res) {
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        Video.find({ '_id' : { $in: user.favoriteVideos }  }, function (err, data) {
            res.json(data);
        })
        .populate('tags')
        .populate('comments')
        .populate('sporter');
    });
}

function getCoachingVideos(req, res) {
    User.findOne({ 'userName' : req.params.username }, function (err, user) {
        Video.find({ 'sporter' : { $in: user.sporters }  }, function (err, data) {
            res.json(data);
        })
        .populate('tags')
        .populate('comments')
        .populate('sporter');
    });
}

router.route('/')
    .get(getVideos)

router.route('/:id')
    .get(getVideos)
    .delete(deleteVideo);

router.route('/:username')
     .post(addVideo);

router.route('/:id/video')
    .get(getVideo);

router.route('/:id/favorite/:username')
    .get(favorite);

router.route('/:id/unfavorite/:username')
    .get(unfavorite);

router.route('/:username/favorites')
    .get(getFavoriteVideos);

router.route('/:username/coach')
    .get(getCoachingVideos);

module.exports = function (errCallback){
    console.log('Initializing video routing module');
    handleError = errCallback;
    return router;
};
