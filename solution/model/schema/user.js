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
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }
    ],

}, {
    timestamps: true
});

// Define a pre-save hook to generate the avatar URL based on first name and last name
userSchema.virtual('avatar_url').get(function() {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.first_name)}+${encodeURIComponent(this.last_name)}&background=random&rounded=true&color=fff`;
});

userSchema.set('toJSON', {
    virtuals: true
});

module.exports = {
    User: mongoose.model('User', userSchema)
}