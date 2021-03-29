const mongoose = require('mongoose');
const { Schema } = mongoose;

const Events = new Schema({    
    image: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
});

module.exports = mongoose.model('Events', Events);