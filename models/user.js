/**
 * Created by Niels on 2-3-2017.
 */
var mongoose = require('mongoose');
//var Video = mongoose.model('Video');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    dateOfBirth: {type: Date, required: false},
    city: {type: String, required: false},
    rfid: {type: String, required: false},
    //videos: [{ type: ObjectId, ref: 'Video', required: false }],
    created_at: {type: Date, required: false, default: Date.now},
    updated_at: {type: Date, required: false, default: Date.now}
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);