const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
        target_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: true
        },
        target_post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            autopopulate: true
        },
        state: {
            type: Number,
            required: true
        },
        notification_type: {
            type: Number,
            required: true
        },
        seen: {
          type: Boolean,
          default: false,
          required: true
        },
        content: {
            title: {
                type: String,
                required: true
            },
            body: {
                type: String,
                required: true
            }
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.plugin(require('mongoose-autopopulate'));

module.exports = {
    Notification: mongoose.model('Notification', notificationSchema)
}