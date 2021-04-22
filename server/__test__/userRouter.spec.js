const request = require("supertest");
const { app, server } = require("../main");
const mongoose = require('mongoose')
const auth = require('../src/auth')
const yookassa = require('../src/yokassaAPI')

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
        auth.sendUserCode = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });

        const response = await request(app).post("/azia/api/users/input").send({ phone: "+79200000000" });
        expect(auth.sendUserCode).toBeCalledTimes(1);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            'result': 'ok'
        });
    });

    test('should error input', async () => {
        auth.sendUserCode = jest.fn().mockImplementation(() => {
            return Promise.reject();
        });
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
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            expect(criteria.user_id).toBe(data._id);
            return {};
        });
        const response = await request(app).post("/azia/api/users/login").send({ phone: '+79200000000' });
        expect(auth.checkUserCode).toBeCalledTimes(1);
        expect(fn).toBeCalledTimes(1);
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
        let data = {};
        auth.checkUserCode = jest.fn().mockImplementation(() => {
            return Promise.reject();
        });
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return {};
        });
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
        let data = {
            _id: 1,
            phone: '+79200000000',
            token: '99508ef0-1868-4eb5-9311-a9bc342bff62',
            activeOrder: {},
            orders: new Array(),
            address: {}
        };
        let fn = mongoose.Query.prototype["findOne"] = jest.fn()
            .mockImplementationOnce(function (criteria, doc, options, callback) {
                expect(criteria.phone).toBe(data.phone);
                expect(criteria.token).toBe(data.token);
                return data;
            })
            .mockImplementationOnce(function (criteria, doc, options, callback) {
                expect(criteria.user_id).toBe(data._id);
                return {};
            })
        const response = await request(app).post("/azia/api/users/info").send({ phone: data.phone, token: data.token });
        expect(response.statusCode).toBe(200);
        expect(fn).toBeCalledTimes(2);
        expect(response.body).toEqual({
            'phone': data.phone,
            'token': data.token,
            'history': [],
            'activeOrder': {},
            'address': data.address
        });
    });

    test('should error info user', async () => {        
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return {};
        });
        const response = await request(app).post("/azia/api/users/info").send({ phone: "", token: "" });
        expect(response.statusCode).toBe(401);
        expect(fn).toBeCalledTimes(1);
    });
});