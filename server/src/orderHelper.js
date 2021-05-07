const mongoose = require('mongoose');
const Address = require('../models/addressModel');
const Shop = require('../models/shopsModel');
const ActiveOrders = require('../models/activeOrders');
const Users = require('../models/userModel');

async function isExistAddress(adr) {
  let address = await Address.findOne({
    city: adr.city,
    streets: {
      $elemMatch: {
        name: adr.street,
        houses: { $elemMatch: { $eq: adr.house } },
      },
    },
  });
  return !!address;
}

async function isExistOrder(phoneUser) {
  return !!(await ActiveOrders.findOne({ phone: phoneUser }, { _id: 1 }));
}

async function updateUserAddress(phoneUser, adr) {
  let user = await Users.findOne({ phone: phoneUser }, { _id: 1 });
  user.address = adr;
  user.save();
  return user;
}

async function aggregateMenu(shop_id, menu) {
  let items = await Shop.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(shop_id) } },
    { $unwind: '$items.menu' },
    {
      $match: {
        'items.menu.id': { $in: menu.map((item) => item.id) },
        'items.menu.isEnd': false,
      },
    },
    {
      $project: { _id: 1, item_id: '$items.menu.id', cost: '$items.menu.cost' },
    },
    {
      $addFields: {
        count: {
          $arrayElemAt: [
            menu.map((item) => item.count),
            { $indexOfArray: [menu.map((item) => item.id), '$item_id'] },
          ],
        },
      },
    },
  ]);

  return items;
}

async function calcCostMenu(shop_id, menu) {
  let items = await aggregateMenu(shop_id, menu);
  items.cost = items.reduce((accumulator, value) => {
    return (accumulator += value.count * value.cost);
  }, 0);

  return items;
}

async function verifyUserData(phone, address) {
  if (await isExistOrder(phone)) {
    throw new Error('Заказ уже есть');
  }
  if (!(await isExistAddress(address))) {
    throw new Error('Адрес не существует');
  }
}

function verifyOrderData(items, req_menu, shop) {
  if (items.length !== req_menu.length) {
    throw new Error('Блюдо закончилось');
  }
  if (items.cost < shop.min_cost_delivery) {
    throw new Error('Маленькая цена заказа');
  }
}

async function createOrder(config) {
  let order = new ActiveOrders();
  order.id = config.order_id;
  order.user_id = config.user_id;
  order.shop_id = config.shop_id;
  order.payment_id = config.payment_id;
  order.menu = config.menu;
  order.items_cost = config.menu_cost;
  order.delivery_cost = config.delivery_cost;
  order.total = config.total_cost;
  order.datetime = new Date();
  order.address = config.address_delivery;
  order.phone = config.phoneOrder;
  order.comment = config.comment;
  order.status = 'wait_payment';
  await order.save();

  return order;
}

module.exports = {
  aggregateMenu,
  updateUserAddress,
  calcCostMenu,
  verifyUserData,
  verifyOrderData,
  createOrder,
};
