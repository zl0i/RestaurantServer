const yookassa = require('../src/yokassaAPI');
const axios = require('axios');
const ActiveOrders = require('../models/activeOrders')

jest.mock('axios')

describe('Test create payment', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('create payment', async () => {
        let order = {
            total: 400,
            id: 5,
            description: "description"
        }
        let reply = {
            data: {
                id: 1,
                confirmation: {
                    confirmation_token: "1q2w3e4r"
                }
            }
        }
        let fn = axios.mockImplementation(() => Promise.resolve(reply));

        let config = await yookassa.createPaymentOrder(order.total, order.id, order.description);
        expect(fn).toBeCalledTimes(1);
        expect(config).toEqual({
            token: reply.data.confirmation.confirmation_token,
            payment_id: reply.data.id
        });
        expect(fn.mock.calls[0][0]).toMatchObject({
            method: 'post',
            url: 'https://api.yookassa.ru/v3/payments',
            headers: { 'Content-Type': 'application/json', 'Idempotence-Key': order.id },
            data: {
                amount: {
                    value: String(Number(order.total).toFixed(2)),
                    currency: 'RUB'
                },
                confirmation: { type: 'embedded' },
                capture: true,
                description: order.description
            }
        });
    });

    test('error create payment', async () => {
        let order = {
            total: 400,
            id: 5,
            description: "description"
        }

        let fn = axios.mockImplementation(() => { throw new Error('error') });

        await expect(yookassa.createPaymentOrder(order.total, order.id, order.description)).rejects.toThrow('error');
        expect(fn).toBeCalledTimes(1);
    });

});

describe('Test check status payments', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('succeeded status payment', async () => {
        let orders = [{ id: 1 }]

        let reply = { data: { status: 'succeeded' } }

        let findOrdersMock = ActiveOrders.find = jest.fn().mockImplementation(() => {
            return Promise.resolve(orders);
        });
        let getStatusOrderMock = axios.get.mockImplementation(() => {
            return Promise.resolve(reply);
        });
        let updateStatusOrderMock = ActiveOrders.updateOne = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });

        await yookassa.checkStatusPayments();
        expect(findOrdersMock).toBeCalledTimes(1);
        expect(getStatusOrderMock).toBeCalledTimes(orders.length);
        expect(updateStatusOrderMock).toBeCalledTimes(orders.length);
    });

    test('canceled status payment', async () => {
        let orders = [{ id: 1 }]

        let reply = { data: { status: 'canceled' } }

        let findOrdersMock = ActiveOrders.find = jest.fn().mockImplementation(() => {
            return Promise.resolve(orders);
        });
        let getStatusOrderMock= axios.get.mockImplementation(() => {
            return Promise.resolve(reply);
        });
        let deleteOrderMock = ActiveOrders.deleteOne = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });

        await yookassa.checkStatusPayments();
        expect(findOrdersMock).toBeCalledTimes(1);
        expect(getStatusOrderMock).toBeCalledTimes(orders.length);
        expect(deleteOrderMock).toBeCalledTimes(orders.length);
    });

    test('error status payment', async () => {
        let orders = [{ id: 1 }];

        let findOrdersMock = ActiveOrders.find = jest.fn().mockImplementation(() => {
            return Promise.resolve(orders);
        });
        let getStatusOrder = axios.get.mockImplementation(() => {
            throw new Error();
        });
        let updateStatusOrderMock = ActiveOrders.updateOne = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });
        let deleteOrderMock = ActiveOrders.deleteOne = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });

        await yookassa.checkStatusPayments();
        expect(findOrdersMock).toBeCalledTimes(1);
        expect(getStatusOrder).toBeCalledTimes(1);
        expect(updateStatusOrderMock).toBeCalledTimes(0);
        expect(deleteOrderMock).toBeCalledTimes(0);
    });

});
