var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
Tag = mongoose.model('Tag');

function getTags(req, res){
    var query = {};
    if (req.params.id) {
        query.tag = req.params.id;
    }

    Tag.find(query).then(data => {
      console.log(data);
      if (req.params.id) {
        data = data[0];
      }
      res.json(data);
    }).fail(err => handleError(req, res, 500, err));
}

function addTag(req, res){
    console.log("adding Tag");
    var tag = new Tag(req.body);
    tag.created_at = Date.now();
    tag.updated_at = Date.now();
    tag
        .save()
        .fail(err => handleError(req, res, 500, err));
}

function patchTag(req, res){
    var tag;
    Tag.findOne({ 'tag' : req.body.tag }, 'tag', function (err, tagje) {
        tag = new Tag(tagje);
        console.log(tag);
        console.log(tagje);
    });
}

function deleteTag(req, res){
    Tag.remove({
        tag: req.params.id
    }, function(err, tagje){
        if (err) {handleError(req, res, 500, err); }
        res.json({ message: "Tag successfully deleted" });
    });
}

/* GET coachs listing. */
router.route('/')
    .get(getTags)
    .post(addTag);

router.route('/:id')
    .get(getTags)
    .delete(deleteTag);

module.exports = function (errCallback){
    console.log('Initializing tags routing module');
    handleError = errCallback;
    return router;
}
