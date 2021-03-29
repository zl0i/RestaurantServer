const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ActiveOrders = require('../models/activeOrders')
const Users = require('../models/userModel')
const Shop = require('../models/shopsModel')
const Address = require('../models/addressModel')
const yookassa = require('../src/yokassaAPI')

router.get('/', async (req, res) => {
    try {
        res.json(await ActiveOrders.find({}, { "__v": false }))
    } catch (e) {
        res.status(500).json({ result: "error" })
    }
})

router.post("/", async (req, res) => {
    try {
        let order = new ActiveOrders();

        if (await ActiveOrders.findOne({ phone: req.body.phoneUser }, { _id: 1 })) {
            throw new Error("Заказ уже есть")
        }

        let user = await Users.findOne({ phone: req.body.phoneUser }, { _id: 1 })
        order.user_id = user._id
        user.address = req.body.address;
        user.save()

        let shop = await Shop.findOne({ _id: req.body.shop_id })

        let items = await Shop.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.body.shop_id) } },
            { $unwind: "$items.menu" },
            { $match: { "items.menu.id": { $in: req.body.menu.map(item => item.id) }, "items.menu.isEnd": false } },
            { $project: { _id: 1, item_id: "$items.menu.id", cost: "$items.menu.cost" } },
            { $addFields: { count: { $arrayElemAt: [req.body.menu.map(item => item.count), { $indexOfArray: [req.body.menu.map(item => (item.id)), '$item_id'] }] } } }
        ]);

        if (items.length !== req.body.menu.length) {
            throw new Error("Блюдо закончилось")
        }

        let address = await Address.findOne({
            city: req.body.address.city,
            streets: {
                $elemMatch: {
                    name: req.body.address.street,
                    houses: { $elemMatch: { $eq: req.body.address.house } }
                }
            }
        })
        if (!address) {
            throw new Error("Адрес не существует")
        }

        let items_cost = items.reduce((accumulator, value) => {
            return accumulator += (value.count * value.cost)
        }, 0)
        if (items_cost < shop.min_cost_delivery) {
            throw new Error("Маленькая цена заказа")
        }
        let delivery_cost = shop.delivery_city_cost[req.body.address.city]

        order.id = uuidv4();
        order.menu = req.body.menu;
        order.items_cost = items_cost
        order.delivery_cost = delivery_cost
        order.total = items_cost + delivery_cost;
        order.shop_id = req.body.shop_id;
        order.datetime = new Date();
        order.address = req.body.address;
        order.phone = req.body.phoneOrder;
        order.comment = req.body.comment;
        order.status = "wait_payment";

        let config = await yookassa.createPaymentOrder(order.total, order.id, 'Ваш заказ');
        order.payment_id = config.payment_id;
        await order.save();

        res.json({
            payment_token: config.token,
            order_id: order._id,
            total: order.total
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({
            result: e.message
        })
    }
})


router.delete("/:id", async (req, res) => {
    try {
        let order = await ActiveOrders.findOne({ id: req.params.id })
        if (order.status === 'wait_payment' ||
            order.status === 'accepted' ||
            order.status === 'coocking') {
            await ActiveOrders.deleteOne({ id: req.params.id })
            res.json({
                "result": "ok"
            })
        } else {
            throw new Error()
        }
    } catch (e) {
        console.log(e)
        res.status(400).json({
            result: e.message
        })
    }
})
module.exports = router;