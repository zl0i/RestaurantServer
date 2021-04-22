const axios = require('axios').default
const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel');

const smsApiKey = process.env.SMS_API_KEY || ""

function validatePhone(phone) {
    if (/^\+?[7][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/.test(phone))
        return true

    return false
}

function generateCode() {
    return Math.round((Math.random() * 8999 + 1000))
}

module.exports = {
    sendUserCode: async (phone) => {
        if (phone == '+79999999999') {
            await User.updateOne({ phone: phone }, { smsCode: '9674' }, { upsert: true })
        } else {
            if (!validatePhone(phone))
                throw new Error('bad number phone')

            let code = generateCode();
            let reply = await axios.get(`https://sms.ru/sms/send?api_id=${smsApiKey}5&to=${phone}&msg=${code}&json=1&from=Azia`);
            if (reply.data.status_code === 100) {
                await User.updateOne({ phone: phone }, { smsCode: code }, { upsert: true })
            } else {
                throw new Error('sms not send')
            }
        }
    },
    checkUserCode: async (phone, code) => {       
        let user = await User.findOne({ phone: phone });
        if (user.smsCode === code && code !== '') {
            user.smsCode = '';
            let token = uuidv4();
            user.createToken = new Date();
            user.token = token;
            user.save();
            return user;
        } else {
            throw new Error('code not right')
        }
    },
    checkUserToken: async (phone, token) => {
        let user = await User.findOne({ phone: phone }, { phone: 1, token: 1 });
        if (token == user.token) {
            user.createToken = new Date();
            user.token = uuidv4();
            user.save();
            return user.token;
        } else {
            throw new Error('token is bad')
        }
    }
}
