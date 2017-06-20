var express = require('express');
var router = express();
var handleError;
var async = require('async');

var mongoose = require('mongoose');
CommentModel = mongoose.model('Comment');
Video = mongoose.model('Video');

function getComments(req, res){
    var query = {};
    if (req.params.id) {
        query.comment = req.params.id;
    }

    CommentModel.find(query).then(data => {
      console.log(data);
      if (req.params.id) {
        data = data[0];
      }
      res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addComment(req, res){
    var comment = new CommentModel(req.body);
    comment.created_at = Date.now();
    comment.updated_at = Date.now();
    comment.save()
        .then(comment => {
            addCommentTovideo(req, res, comment);
        })
        .fail(err => handleError(req, res, 500, err));
}

function addCommentTovideo(req, res, comment) {
    Video.findOne({'_id': req.body.videoId})
        .then(video => {
                video.comments.push(comment);
                video.save()
                    .then(comment => {
                        res.status(201).json(comment);
                    });
            }
        )
}

router.route('/')
    .get(getComments)
    .post(addComment);

module.exports = function (errCallback){
    console.log('Initializing comments routing module');
    handleError = errCallback;
    return router;
};