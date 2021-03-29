const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActiveOrders = new Schema({
    id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String,
        required: true
    },
    shop_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    menu: [
        {
            id: {
                type: Number,
                required: true
            },
            count: {
                type: Number,
                required: true
            }
        }
    ],
    items_cost: {
        type: Number,
        required: true
    },
    delivery_cost: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    datetime: {
        type: Date,
        required: true,
        default: new Date()
    },
    user_id: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        street: {
            type: String,
            require: true
        },
        house: {
            type: String,
            require: true
        },
        flat: {
            type: String,
            require: true
        }
    },
    phone: {
        type: String,
        require: true
    },
    comment: String,
    status: {
        type: String,
        enum: ["wait_payment", "accepted", "coocking", "delivering", "success", "canseled"],
        required: true
    }
});

module.exports = mongoose.model('ActiveOrders', ActiveOrders);