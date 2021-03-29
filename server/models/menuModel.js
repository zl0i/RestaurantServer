const mongoose = require('mongoose');
const { Schema } = mongoose;

const Menu = new Schema({
    shop_id: {
        type: String,
        required: true
    },
    category: {
        type: Array,
        required: true
    },
    menu: {
        name: String,
        category: String,
        description: String,
        cost: Number,
        image: String,
        isEnd: {
            type: Boolean,
            default: false
        }
    }
});

module.exports = mongoose.model('Menu', Menu)