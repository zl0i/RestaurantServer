const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
  login: String,
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  }
});

module.exports = mongoose.model('User', User);
