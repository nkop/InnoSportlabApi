/**
 * Created by Niels Kop on 08-Mar-17.
 */

var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
    tag: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

mongoose.model('Tag', tagSchema);
