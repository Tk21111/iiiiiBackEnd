const mongoose = require('mongoose')

const howSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    public : Boolean ,
    tag : [String],
    des : String,
    imagePath : [String],

})

module.exports = mongoose.model('How' , howSchema)