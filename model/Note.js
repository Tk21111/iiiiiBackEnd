const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    text : {
        type : String,
        required : true
    },
    typeCount : {
        type : String,
        required : true
    },
    count : {
        type : [Number],
        require : true
    },
    countExp : {
        type : [Number],
        default : null
    },
    timeOut : {
        type : Date
    },
    tag : {
        type : [String]
    },
    done : {
        type : Boolean,
        default : false
    },
    donate : {
        type : Boolean,
        default : false
    },
    images : {
        type : [String]
    }
},
    {
        timestamps : true
    }
)

module.exports = mongoose.model('Note' , noteSchema)