var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var ObjectId = mongoose.Schema.Types.ObjectId;

var videoSchema = new mongoose.Schema({
    tags: [{ type: ObjectId, ref: 'Tag' }],
    comments: [{ type: ObjectId, ref: 'Comment' }],
    sporter: { type: ObjectId, ref: 'User', required: true},
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

mongoose.model('Video', videoSchema);
