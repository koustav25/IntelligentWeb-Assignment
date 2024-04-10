const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: true
        },
        content: {
            type: String,
            required: true
        },
        likes: {
            type: Number,
            required: true,
            default: 0
        },
        likers: [
            {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'User',
                required: false,
                autopopulate: true
            }
        ]
    },
    {
        timestamps: true
    }
);
commentSchema.add({replies: [commentSchema, {required: false}]})

const identificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    suggesting_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true
    },
    upvotes: {
        type: Number,
        required: true,
        default: 0
    },
    downvotes: {
        type: Number,
        required: true,
        default: 0
    },
    upvoters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }
    ],
    downvoters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }
    ]
});

const postSchema = new mongoose.Schema({
        posting_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: true
        },
        title: {
            type: String,
            required: true
        },
        state: {
            type: Number,
            required: true
        },
        seen_at: {
            type: Date,
            required: true
        },
        images: [
            {
                image_type: {
                    type: String,
                    required: true
                },
                image_data: {
                    type: Buffer,
                    required: true
                }
            }
        ],
        description: {
            type: String,
            required: true
        },
        location: {
            location_name: {
                type: String,
                required: true
            },
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
        details: {
            height: {
                type: Number,
                required: true
            },
            spread: {
                type: Number,
                required: true
            },
            exposure: {
                type: Number,
                required: true
            },
            has_flowers: {
                type: Boolean,
                required: true
            },
            colour: {
                type: Number,
                required: true
            },
            leaf_type: {
                type: Number,
                required: true
            },
            seed_type: {
                type: Number,
                required: true
            },
        },
        identification: {
            potentials: [
                identificationSchema
            ],
            is_accepted: {
                type: Boolean,
                required: true
            },
            date_accepted: {
                type: Date,
                required: false
            },
            accepted_potential_id: {
                // This is the ObjectId of the accepted potential
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            },
            accepted_potential: {
                // This is the index of the accepted potential in the potentials array
                type: Number,
                required: false
            },
            dbpedia_url: {
                type: String,
                required: false
            }
        },
        comments: [
            commentSchema,
        ],
    },
    {
        timestamps: true
    }
);

postSchema.plugin(require('mongoose-autopopulate'));

module.exports = {
    Post: mongoose.model('Post', postSchema),
}