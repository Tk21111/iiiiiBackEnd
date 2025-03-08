const mongoose = require('mongoose')

const howSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    name : String,
    public : Boolean ,
    tag : [String],
    des : String,
    ingredent : [Object],
    images : [Object],

}, {
    timestamps : true
}
)

module.exports = mongoose.model('How' , howSchema)