const auth = require('../src/auth')
const axios = require('axios').default
const User = require('../models/userModel')
const mongoose = require('mongoose')


jest.mock('axios')
mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());

describe("Test send user code", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should send sms code', async () => {
        let res = {
            data: {
                status_code: 100
            }
        }
        let fn = mongoose.Query.prototype["updateOne"] = jest.fn();
        axios.get.mockImplementation((url) => {
            let path = new URL(url);
            expect(path.searchParams.get('msg').length).toBe(4);
            expect(Number(path.searchParams.get('msg'))).toBeGreaterThan(1000);
            expect(Number(path.searchParams.get('msg'))).toBeLessThan(9999);
            expect(path.searchParams.get('to')).toBe(' 79200000000');
            return res;
        });

        await auth.sendUserCode("+79200000000");

        expect(axios.get).toBeCalledTimes(1);
        expect(fn).toBeCalledTimes(1);
    });

    test('should error send sms code', async () => {
        let res = {
            data: {
                status_code: 400
            }
        }
        let fn = mongoose.Query.prototype["updateOne"] = jest.fn();
        axios.get.mockReturnValue(res);

        await expect(auth.sendUserCode("+79200000000")).rejects.toThrow('sms not send');
        expect(axios.get).toBeCalledTimes(1);
        expect(fn).toBeCalledTimes(0);
    });

    test('should not send sms on error phone', async () => {
        let res = {
            data: {
                status_code: 100
            }
        }
        axios.get.mockReturnValue(res);
        axios.post.mockReturnValue(res);
        let fn = mongoose.Query.prototype["updateOne"] = jest.fn();


        await expect(auth.sendUserCode('+79')).rejects.toThrow('bad number phone');
        await expect(auth.sendUserCode('89000000000')).rejects.toThrow('bad number phone');
        await expect(auth.sendUserCode('8(900)000-00-00')).rejects.toThrow('bad number phone');

        expect(axios.get).toBeCalledTimes(0);
        expect(axios.post).toBeCalledTimes(0);
        expect(fn).toBeCalledTimes(0);
    });

    test('not should send sms code on +79999999999', async () => {

        let fn = mongoose.Query.prototype["updateOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            expect(doc.smsCode).toBe('9674');
            expect(doc['$setOnInsert']).toEqual({ __v: 0 });
        });

        await auth.sendUserCode('+79999999999');
        expect(axios.get).toBeCalledTimes(0);
        expect(axios.post).toBeCalledTimes(0);
        expect(fn).toBeCalledTimes(1);
    });
});


describe("Test check user code", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should check sms code', async () => {
        let data = {
            smsCode: '1587',
            token: '',
            save: jest.fn()
        };
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return data;
        });
        let user = await auth.checkUserCode('+79200000000', '1587');
        expect(fn).toBeCalledTimes(1);
        expect(user).toEqual(data);
        expect(user.smsCode.length).toBe(0);
        expect(user.token).toBeTruthy();
        expect(data.save).toBeCalledTimes(1);
    });

    test('should error check sms code', async () => {
        let data = {
            smsCode: '1587',
            token: '',
            save: jest.fn()
        };
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return data;
        });
        await expect(auth.checkUserCode('+79200000000', '1588')).rejects.toThrow('code not right');
        expect(fn).toBeCalledTimes(1);
        expect(data.save).toBeCalledTimes(0);
    });
});

describe("Test check user token", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should check token', async () => {
        let data = {
            smsCode: '',
            token: '99508ef0-1868-4eb5-9311-a9bc342bff62',
            save: jest.fn()
        };
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return data;
        });
        let token = await auth.checkUserToken('+79200000000', data.token); 
        expect(fn).toBeCalledTimes(1);          
        expect('99508ef0-1868-4eb5-9311-a9bc342bff62').not.toBe(token);
        expect(data.save).toBeCalledTimes(1);      
    });

    test('should error check token', async () => {
        let data = {
            smsCode: '',
            token: '99508ef0-1868-4eb5-9311-a9bc342bff62',
            save: jest.fn()
        };
        let badToken = '99508ef0-1868-4eb5-9311-a9bc342bff63';
        let fn = mongoose.Query.prototype["findOne"] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
            return data;
        });
        
        await expect(auth.checkUserToken('+79200000000', badToken)).rejects.toThrow('token is bad');     
        expect(fn).toBeCalledTimes(1);          
        expect(data.save).toBeCalledTimes(0);      
    });
});