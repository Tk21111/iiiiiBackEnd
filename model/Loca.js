const mongoose = require('mongoose')

const locaSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User',
        default : null
    },
    food : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : 'Note',
        default : null
    },
    getPId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default : null
    },
    district : {
        type : String,
        required : true
    },
    subdistrict : {
        type : String,
        required : true
    },
    province : {
        type : String,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    more : {
        type :String
    },
    images: { 
        type: [String] 
    },
    organisation : {
        type: Boolean,
        default : false
    },
    num : {
        type : Number,
    },
    latitude : {
        type : String
    },
    longitude : {
        type : String
    },
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Post',
        default : null
    }

})

module.exports = mongoose.model('Loca' , locaSchema)