const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    roles: {
        type : [String],
        default : ["User"]
    },
    image: {
        type: [Object],
    },
    more: {
        type: String,
    },
    aka: {
        type: String,
    },
    noti: {
        type : [Object],
    },
    postsave : {
        type : [mongoose.Schema.Types.ObjectId],
        default : [],
        ref : 'Post'
    },
    name : {
        type : String
    },
    sex : {
        type : Boolean,
        require : true
    },
    age : {
        type : Number,
        require : true
    }
})

module.exports = mongoose.model('User' , userSchema)