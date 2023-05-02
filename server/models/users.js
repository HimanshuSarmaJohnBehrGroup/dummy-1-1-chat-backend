const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String },
    fcm_token: { type: String },
    socketId: { type: String }
})


exports.UserSchema = mongoose.model('Users', UserSchema);