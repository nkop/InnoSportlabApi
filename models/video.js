/**
 * Created by Niels on 2-3-2017.
 */

var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');
var User = mongoose.model('User');
var ObjectId = mongoose.Schema.Types.ObjectId;


var videoSchema = new mongoose.Schema({
    filePath: { type: String, required: true },
    tags: [{ type: ObjectId, ref: 'Tag' }],
    sporter: [{ type: ObjectId, ref: 'User'}],
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

mongoose.model('Video', videoSchema);
