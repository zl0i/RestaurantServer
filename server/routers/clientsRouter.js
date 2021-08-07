const express = require('express');
const Cleint = require('../models/clientsModel');
const auth = require('../src/auth');
const ActiveOrders = require('../models/activeOrders');
const checker = require('../middleware/schemaChecker');

const router = express.Router();

router.post('/input', [checker.check('body', { phone: String })], async (req, res) => {
  try {
    await auth.sendUserCode(req.body.phone);
    res.status(200).json({
      result: 'ok',
    });
  } catch (error) {
    res.status(500).end();
  }
});

router.post('/login', [checker.check('body', { phone: String, code: String })], async (req, res) => {
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

router.post('/info', [checker.check('body', { phone: String, token: String })], async (req, res) => {
  try {
    let user = await Cleint.findOne({
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
