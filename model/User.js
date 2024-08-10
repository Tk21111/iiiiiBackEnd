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
        type: [String],
    },
    more: {
        type: String,
    },
    aka: {
        type: String,
    },
})

module.exports = mongoose.model('User' , userSchema)