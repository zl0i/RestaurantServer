const mongoose = require('mongoose');
const { Schema } = mongoose;

const Clients = new Schema({
  login: String,
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  phone: String,
  smsCode: String,
  address: {
    type: Object,
    default: {
      city: "",
      street: "",
      flat: ""
    }
  },
  orders: {
    type: Array,
    default: []
  },
  birthday: Date,
  jwt_token: String,

  vk_id: String,
  vk_access_token: String,
  vk_refresh_token: String,
  vk_token_expired: Number,

  ya_id: String,
  ya_access_token: String,
  ya_refresh_token: String,
  ya_token_expired: Number,
});

module.exports = mongoose.model('Clients', Clients);
