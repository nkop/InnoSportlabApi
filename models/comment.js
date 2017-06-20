var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

mongoose.model('Comment', commentSchema);
