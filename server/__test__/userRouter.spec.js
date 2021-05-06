const request = require("supertest");
const { app, server } = require("../main");
const mongoose = require('mongoose')
const auth = require('../src/auth')
const yookassa = require('../src/yokassaAPI')
const ActiveOrders = require('../models/activeOrders')
const User = require('../models/userModel')

yookassa.startCheckStatusPayments = jest.fn()
mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());

afterAll(() => {
    server.close();
});

describe("Test input user", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should send sms code", async () => {
        auth.sendUserCode = jest.fn().mockImplementation(() => Promise.resolve());

        const response = await request(app).post("/azia/api/users/input").send({ phone: "+79200000000" });
        expect(auth.sendUserCode).toBeCalledTimes(1);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            'result': 'ok'
        });
    });

    test('should error input', async () => {
        auth.sendUserCode = jest.fn().mockImplementation(() => Promise.reject());
        const response = await request(app).post("/azia/api/users/input");
        expect(auth.sendUserCode).toBeCalledTimes(1);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({});
    });
});

describe('Test login user', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should login user', async () => {
        let data = {
            _id: 1,
            token: '99508ef0-1868-4eb5-9311-a9bc342bff62',
            activeOrder: {},
            orders: new Array(),
            address: {}
        };
        auth.checkUserCode = jest.fn().mockImplementation(() => {
            return data;
        });
        let fn = ActiveOrders.findOne = jest.fn().mockReturnValue({});
        const response = await request(app).post("/azia/api/users/login").send({ phone: '+79200000000' });
        expect(auth.checkUserCode).toBeCalledTimes(1);
        expect(fn).toBeCalledTimes(1);
        expect(fn.mock.calls[0][0]['user_id']).toEqual(data._id);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            'result': 'ok',
            'phone': '+79200000000',
            'token': data.token,
            'history': [],
            'activeOrder': {},
            'address': {}
        });
    });

    test('should error login user', async () => {
        auth.checkUserCode = jest.fn().mockImplementation(() => Promise.reject());
        let fn = ActiveOrders.findOne = jest.fn().mockReturnValue({});
        const response = await request(app).post("/azia/api/users/login").send({ phone: '+79200000000' });
        expect(auth.checkUserCode).toBeCalledTimes(1);
        expect(fn).toBeCalledTimes(0);
        expect(response.statusCode).toBe(401);
    });
});

describe('Test info user', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should info user', async () => {
        let user = {
            _id: 1,
            phone: '+79200000000',
            token: '99508ef0-1868-4eb5-9311-a9bc342bff62',
            activeOrder: {},
            orders: new Array(),
            address: {}
        };
        let order = {
            _id: 1,
            cost: 250,
            datetime: ""
        }
        let userMock = User.findOne = jest.fn().mockReturnValue(user)
        let orderMock = ActiveOrders.findOne = jest.fn().mockReturnValue(order) 

        const response = await request(app).post("/azia/api/users/info").send({ phone: user.phone, token: user.token });
        expect(response.statusCode).toBe(200);
        expect(userMock).toBeCalledTimes(1);
        expect(userMock.mock.calls[0][0]).toEqual({ phone: user.phone, token: user.token })
        expect(orderMock).toBeCalledTimes(1);
        expect(orderMock.mock.calls[0][0]).toEqual({ user_id: user._id })
        expect(response.body).toEqual({
            'phone': user.phone,
            'token': user.token,
            'history': [],
            'activeOrder': order,
            'address': user.address
        });
    });

    test('should error info user', async () => {
        let fn = User.findOne = jest.fn().mockReturnValue({});
        const response = await request(app).post("/azia/api/users/info").send({ phone: "", token: "" });
        expect(response.statusCode).toBe(401);
        expect(fn).toBeCalledTimes(1);
    });
});