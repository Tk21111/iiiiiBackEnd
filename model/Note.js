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
    count : {
        type : Number,
        require : true
    },
    done : {
        type : Boolean,
        default : false
    }
},
    {
        timestamps : true
    }
)

module.exports = mongoose.model('Note' , noteSchema)