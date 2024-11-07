const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true,
        minlength: 1 // Ensure content has at least one character
    },
    
    reply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    like: {
        type: [String]
    },
    unlike : {
        type : [String]
    },
    images: {
        type: [String],
        /*
        validate: {
            validator: function(arr) {
                return arr.every(url => url.startsWith('http') || url.startsWith('https'));
            },
            message: 'Each image URL must be a valid URL'
        }
        */
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Post', postSchema);
