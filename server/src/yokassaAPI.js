const axios = require('axios').default
const ActiveOrders = require('../models/activeOrders')

const shipId = process.env.SHIP_ID || '54401'
const apikey = process.env.YOKASSA_APIKEY || 'test_Fh8hUAVVBGUGbjmlzba6TB0iyUbos_lueTHE-axOwM0'

let checker;

module.exports = {
    createPaymentOrder: async function (total, order_id, description) {
        let reply = await axios({
            method: 'post',
            url: 'https://api.yookassa.ru/v3/payments',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': order_id
            },
            auth: {
                username: shipId,
                password: apikey
            },
            data: {
                amount: {
                    "value": String(Number(total).toFixed(2)),
                    "currency": "RUB"
                },
                confirmation: {
                    "type": "embedded"
                },
                capture: true,
                description: description
            }
        })

        return {
            token: reply.data.confirmation.confirmation_token,
            payment_id: reply.data.id
        };
    },
    startCheckStatusPayments: function (minutes) {
        if (!!checker)
            return

        let interval = minutes * 60 * 1000 || 60000;       
        checker = setInterval(checkStatusPayments, interval);
    },
    stopCheckStatusPayments: function () {
        clearInterval(checker);
    },
    handleHook: function (res, req) {
        //проверка ip
    }
}

async function checkStatusPayments() {
    let orders = await ActiveOrders.find({ status: 'wait_payment' });   
    orders.forEach(async order => {
        try {
            let reply = await axios.get(`https://api.yookassa.ru/v3/payments/${order.payment_id}`, {
                auth: {
                    username: shipId,
                    password: apikey
                }
            });            
            switch (reply.data.status) {
                case 'succeeded': {                   
                    await ActiveOrders.updateOne({ id: order.id }, { status: 'accepted' })                   
                    break;
                }                
                case 'canceled': {                    
                    await ActiveOrders.deleteOne({ id: order.id })
                    break;
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
}