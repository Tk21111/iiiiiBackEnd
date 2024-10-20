const mongoose = require('mongoose')

const locaSchema = new mongoose.Schema({
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
    town : {
        type : String,
        required : true
    },
    subdistrict : {
        type : String,
        required : true
    },
    county : {
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
        type: Boolean
    },
    getP : {
        type : String
    },
    getPId: {
        type : String,
    },
    num : {
        type : Number,
    },

})

module.exports = mongoose.model('Loca' , locaSchema)