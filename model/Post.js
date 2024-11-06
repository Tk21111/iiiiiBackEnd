const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    content : {
        require : true,
        type : String,
    },
    reply : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Post'
    },,
    like : Number,
    images : [String],
    //if eId === reply
    eId : {
        type : String,
        require : true,
    },



})

module.exports = mongoose.model('Post' , postSchema)
