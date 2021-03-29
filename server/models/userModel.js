const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
    name: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        /*validator: function(text) {
            return /^\+?[78][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/.test(text)
        },*/
        required: true,
        unique: true
    },
    smsCode: String,
    createToken: Date,
    token: String,
    address: {
        street: {
            type: String,
            require: false
        },
        house: {
            type: String,
            require: false
        },
        flat: {
            type: String,
            require: false
        }
    },
    orders: [
        {
            id: {
                type: Number,
                require: true
            },
            cost: {
                type: Number,
                require: true
            },
            datetime: {
                type: Date,
                require: true
            },
            status: {
                type: String,
                enum: ["success", "canseled"],
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('User', User);