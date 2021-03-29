const mongoose = require('mongoose');
const { Schema } = mongoose;

const Address = new Schema({
    city: {
        type: String,
        required: true
    },
    street: {
       type: Object,
       required: true        
    }    
})

module.exports = mongoose.model('Addresses', Address);