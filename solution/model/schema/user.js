const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    first_name: {
        type: String, required: true
    },
    last_name: {
        type: String, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    username: {
        type: String, required: true, unique: true
    },
    role: {
        type: Number, required: true, default: 0, min: 0, max: 1
    },
    password: {
        type: Buffer, required: true
    },
    salt: {
        type: Buffer, required: true,
    },
    avatar_url: {
        type: String, required: true
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Post',
        }
    ],

}, {
    timestamps: true
});

module.exports = {
    User: mongoose.model('User', userSchema)
}