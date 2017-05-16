var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

User = mongoose.model('User');

var messageSchema = new mongoose.Schema({
    invitor: {type: ObjectId, ref: 'User'},
    message: String,
    read: {type: Boolean, default: false},
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now}
});


mongoose.model('Message', messageSchema);

