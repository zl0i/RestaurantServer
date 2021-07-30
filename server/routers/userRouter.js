const express = require('express');
const User = require('../models/userModel');
const auth = require('../src/auth');
const ActiveOrders = require('../models/activeOrders');

const router = express.Router();

router.post('/input', async (req, res) => {
  try {
    await auth.sendUserCode(req.body.phone);
    res.status(200).json({
      result: 'ok',
    });
  } catch (error) {
    res.status(400).end();
  }
});

router.post('/login', async (req, res) => {
  try {
    let user = await auth.checkUserCode(req.body.phone, req.body.code);
    res.status(200).json({
      result: 'ok',
      phone: req.body.phone,
      token: user.jwt_token,
      history: user.orders.reverse(),
      activeOrder: await ActiveOrders.findOne(
        { user_id: user._id },
        { _id: 0, total: 1, datetime: 1, status: 1 },
      ),
      address: user.address,
    });
  } catch (error) {
    res.status(401).end();
  }
});

router.post('/info', async (req, res) => {
  try {
    let user = await User.findOne({
      phone: req.body.phone,
      jwt_token: req.body.token,
    });
    res.status(200).json({
      phone: user.phone,
      token: user.jwt_token,
      history: user.orders.reverse(),
      activeOrder: await ActiveOrders.findOne(
        { user_id: user._id },
        { _id: 0, id: 1, total: 1, datetime: 1, status: 1, menu: 1 },
      ),
      address: user.address,
    });
  } catch (error) {
    res.status(401).end();
  }
});

module.exports = router;
