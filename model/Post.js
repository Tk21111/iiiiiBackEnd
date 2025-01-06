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
    title : {
        type : String,
    },

    //link with user can see
    userlist : {
        type : [String],
        default : null
    },

    //mesh with other data
    food : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        default: null,
    },
    loca : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loca',
        default: null,
    },
    how : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'How',
        default: null,
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
        type: [Object],
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
