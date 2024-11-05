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
    reply : [String],
    like : Number,
    images : [String],
    //if eId === reply
    eId : {
        type : String,
        require : true,
    },



})

module.exports = mongoose.model('Post' , postSchema)