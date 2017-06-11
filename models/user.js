/**
 * Created by Niels on 2-3-2017.
 */

var mongoose = require('mongoose');


var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');

var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    userName: {type: String, required: true, unique: true},
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    password: {type: String, required: true},
    dateOfBirth: {type: Date, required: false},
    city: {type: String, required: false},
    rfid: {type: String, required: false},
    coach: {type: Boolean, default: false},
    messages: [{ type: ObjectId, ref: 'Message', required: false }],
    favoriteVideos: [{ type: ObjectId, ref: 'Video', required: false }],
    sporters: [{ type: ObjectId, ref: 'User'}],
    created_at: {type: Date, required: false, default: Date.now},
    updated_at: {type: Date, required: false, default: Date.now}
});

userSchema.plugin(uniqueValidator);

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function (next) {
    var user = this;
    user.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
