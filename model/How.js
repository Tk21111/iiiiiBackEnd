const mongoose = require('mongoose')

const howSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    food : String,
    public : Boolean ,
    tag : [String],
    des : String,
    ingredent : [Object],
    images : [String],

})

module.exports = mongoose.model('How' , howSchema)