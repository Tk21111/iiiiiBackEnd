const mongoose = require('mongoose')

const howSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    food : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : 'Note'
    },
    public : Boolean ,
    vote : {
        type : [Number]
    },
    comment : [String],
    howTo : String,
    imagePath : [String],

})

module.exports = mongoose.model('How' , howSchema)