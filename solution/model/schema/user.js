const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 1
        },
        password: {
            type: Buffer,
            required: true
        },
        salt: {
            type: Buffer,
            required: true,
        },
        avatarUrl: {
            type:String,
            required: true
        }

    },
    {
        timestamps: true
    }
);

module.exports = {
    User: mongoose.model('User', userSchema)
}