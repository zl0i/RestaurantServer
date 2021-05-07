const Address = require('../models/addressModel')
const Shop = require('../models/shopsModel')
const ActiveOrders = require('../models/activeOrders')
const Users = require('../models/userModel')
const orderHelper = require('../src/orderHelper')
const { Promise } = require('mongoose')

describe('test calcCostMenu', () => {

    test('right calc', async () => {
        let menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 },
        ]
        let fn = Shop.aggregate = jest.fn().mockImplementation(() => {
            return Promise.resolve(menu);
        });
        let items = await orderHelper.calcCostMenu(1, menu)
        expect(fn).toBeCalledTimes(1);
        expect(items.cost).toBe(500);
    });
});

describe('test verifyOrderData', () => {
    test('should not throw error', () => {
        let menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 },
        ]
        menu.cost = 500;
        let req_menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 },
        ]
        let shop = {
            min_cost_delivery: 400
        }


        expect(() => orderHelper.verifyOrderData(menu, req_menu, shop)).not.toThrow()
    })

    test('should throw error dish is over', () => {
        let menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 }
        ]
        menu.cost = 500;
        let req_menu = [
            { count: 1, cost: 200 }
        ]
        let shop = {
            min_cost_delivery: 400
        }

        expect(() => orderHelper.verifyOrderData(menu, req_menu, shop)).toThrow('Блюдо закончилось');
    });

    test('should throw error small order price', () => {
        let menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 },
        ]
        menu.cost = 500;
        let req_menu = [
            { count: 1, cost: 200 },
            { count: 3, cost: 100 }
        ]
        let shop = {
            min_cost_delivery: 800
        }

        expect(() => orderHelper.verifyOrderData(menu, req_menu, shop)).toThrow('Маленькая цена заказа');
    });
})