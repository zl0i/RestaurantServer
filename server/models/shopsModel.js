const mongoose = require('mongoose');
const { Schema } = mongoose;

const Shop = new Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    delivery_status: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    min_cost_delivery: {
        type: Number,
        required: true
    },
    delivery_city_cost: {
        type: Object,
        required: true
    },
    work_time: {
        type: String,
        required: true
    },
    items: {
        category: {
            type: Array,
            required: true
        },
        menu: [
            {
                _id: mongoose.Types.ObjectId,
                name: String,
                cost: Number,
                description: String,
                image: String,
                category_index: Number,
                isEnd: Boolean
            }
        ]
    }
})

module.exports = mongoose.model('Shop', Shop);