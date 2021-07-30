const request = require('supertest');
const { app, server } = require('../main');
const mongoose = require('mongoose');
const yookassa = require('../src/yokassaAPI');
const orderHelper = require('../src/orderHelper');
let { v4: uuidv4 } = require('uuid');

const ActiveOrders = require('../models/activeOrders');
const Shop = require('../models/shopsModel');

yookassa.startCheckStatusPayments = jest.fn();
mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());
jest.mock('uuid');

afterAll(() => {
  server.close();
});

describe('GET /orders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get all active orders', async () => {
    let fn = (ActiveOrders.find = jest.fn().mockImplementation(() => Promise.resolve([])));

    const response = await request(app).get('/restaurant/api/orders');
    expect(fn).toBeCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({});
    expect(response.statusCode).toBe(200);
  });

  test('should error get all active orders', async () => {
    let fn = (ActiveOrders.find = jest.fn().mockImplementation(() => Promise.reject()));

    const response = await request(app).get('/restaurant/api/orders');
    expect(fn).toBeCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({});
    expect(response.statusCode).toBe(500);
  });
});

describe('POST /orders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create new order', async () => {
    let order = {
      id: 52,
      phoneUser: '+79200000000',
      address: {
        city: 'Moscow',
      },
      shop_id: 3,
      menu: [{ id: 4, count: 5 }],
    };

    let user = { _id: 1 };

    let shop = {
      _id: 1,
      delivery_city_cost: {
        Moscow: 100,
      },
    };

    let payment = {
      id: 1,
      token: '1q2w3e4r5t',
    };

    let items = [{ id: 1, count: 4 }];
    items.cost = 800;
    let total_cost = items.cost + shop.delivery_city_cost[order.address.city];

    let verifyUserDataMock = (orderHelper.verifyUserData = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));
    let verifyOrderDataMock = (orderHelper.verifyOrderData = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));
    let updateUserAddressMock = (orderHelper.updateUserAddress = jest
      .fn()
      .mockImplementation(() => Promise.resolve(user)));
    let findShopMock = (Shop.findOne = jest.fn().mockImplementation(() => Promise.resolve(shop)));
    let calcCostMenuMock = (orderHelper.calcCostMenu = jest
      .fn()
      .mockImplementation(() => Promise.resolve(items)));
    let uuidv4Mock = uuidv4.mockReturnValue(order.id);
    let createPaymentMock = (yookassa.createPaymentOrder = jest
      .fn()
      .mockImplementation(() => Promise.resolve(payment)));
    let createOrderMock = (orderHelper.createOrder = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    const response = await request(app).post(`/restaurant/api/orders`).send(order);

    expect(response.statusCode).toBe(200);
    expect(verifyUserDataMock).toBeCalledTimes(1);
    expect(updateUserAddressMock).toBeCalledTimes(1);
    expect(updateUserAddressMock.mock.calls[0]).toEqual([order.phoneUser, order.address]);
    expect(findShopMock).toBeCalledTimes(1);
    expect(findShopMock.mock.calls[0]).toEqual([{ _id: order.shop_id }]);
    expect(calcCostMenuMock).toBeCalledTimes(1);
    expect(calcCostMenuMock.mock.calls[0]).toEqual([order.shop_id, order.menu]);
    expect(verifyOrderDataMock).toBeCalledTimes(1);
    expect(verifyOrderDataMock.mock.calls[0]).toEqual([items, order.menu, shop]);
    expect(uuidv4Mock).toBeCalledTimes(1);
    expect(createPaymentMock).toBeCalledTimes(1);
    expect(createPaymentMock.mock.calls[0]).toEqual([total_cost, order.id, 'Ваш заказ']);
    expect(createOrderMock).toBeCalledTimes(1);
    expect(response.body).toEqual({
      payment_token: payment.token,
      order_id: order.id,
      total: total_cost,
    });
  });

  test('error verify user data', async () => {
    let order = {
      id: 52,
      phoneUser: '+79200000000',
      address: {
        city: 'Moscow',
      },
      shop_id: 3,
      menu: [{ id: 4, count: 5 }],
    };

    let verifyUserDataMock = (orderHelper.verifyUserData = jest.fn().mockImplementation(() => {
      throw new Error('error verify user data');
    }));
    let createOrderMock = (orderHelper.createOrder = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    const response = await request(app).post(`/restaurant/api/orders`).send(order);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ result: 'error verify user data' });
    expect(verifyUserDataMock).toBeCalledTimes(1);
    expect(createOrderMock).toBeCalledTimes(0);
  });

  test('error verify order data', async () => {
    let order = {
      id: 52,
      phoneUser: '+79200000000',
      address: {
        city: 'Moscow',
      },
      shop_id: 3,
      menu: [{ id: 4, count: 5 }],
    };

    let user = { _id: 1 };

    let shop = {
      _id: 1,
      delivery_city_cost: {
        Moscow: 100,
      },
    };

    let items = [{ id: 1, count: 4 }];
    items.cost = 800;

    let verifyUserDataMock = (orderHelper.verifyUserData = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));
    let updateUserAddressMock = (orderHelper.updateUserAddress = jest
      .fn()
      .mockImplementation(() => Promise.resolve(user)));
    let findShopMock = (Shop.findOne = jest.fn().mockImplementation(() => Promise.resolve(shop)));
    let calcCostMenuMock = (orderHelper.calcCostMenu = jest
      .fn()
      .mockImplementation(() => Promise.resolve(items)));
    let verifyOrderDataMock = (orderHelper.verifyOrderData = jest.fn().mockImplementation(() => {
      throw new Error('error verify order data');
    }));
    let createOrderMock = (orderHelper.createOrder = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    const response = await request(app).post(`/restaurant/api/orders`).send(order);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ result: 'error verify order data' });
    expect(verifyUserDataMock).toBeCalledTimes(1);
    expect(updateUserAddressMock).toBeCalledTimes(1);
    expect(findShopMock).toBeCalledTimes(1);
    expect(calcCostMenuMock).toBeCalledTimes(1);
    expect(verifyOrderDataMock).toBeCalledTimes(1);
    expect(createOrderMock).toBeCalledTimes(0);
  });

  test('error create payment', async () => {
    let order = {
      id: 52,
      phoneUser: '+79200000000',
      address: {
        city: 'Moscow',
      },
      shop_id: 3,
      menu: [{ id: 4, count: 5 }],
    };

    let user = { _id: 1 };

    let shop = {
      _id: 1,
      delivery_city_cost: {
        Moscow: 100,
      },
    };

    let items = [{ id: 1, count: 4 }];
    items.cost = 800;
    let total_cost = items.cost + shop.delivery_city_cost[order.address.city];

    let verifyUserDataMock = (orderHelper.verifyUserData = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));
    let verifyOrderDataMock = (orderHelper.verifyOrderData = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));
    let updateUserAddressMock = (orderHelper.updateUserAddress = jest
      .fn()
      .mockImplementation(() => Promise.resolve(user)));
    let findShopMock = (Shop.findOne = jest.fn().mockImplementation(() => Promise.resolve(shop)));
    let calcCostMenuMock = (orderHelper.calcCostMenu = jest
      .fn()
      .mockImplementation(() => Promise.resolve(items)));
    let uuidv4Mock = uuidv4.mockReturnValue(order.id);
    let createPaymentMock = (yookassa.createPaymentOrder = jest.fn().mockImplementation(() => {
      throw new Error('error create payment');
    }));
    let createOrderMock = (orderHelper.createOrder = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    const response = await request(app).post(`/restaurant/api/orders`).send(order);

    expect(verifyUserDataMock).toBeCalledTimes(1);
    expect(updateUserAddressMock).toBeCalledTimes(1);
    expect(updateUserAddressMock.mock.calls[0]).toEqual([order.phoneUser, order.address]);
    expect(findShopMock).toBeCalledTimes(1);
    expect(findShopMock.mock.calls[0]).toEqual([{ _id: order.shop_id }]);
    expect(calcCostMenuMock).toBeCalledTimes(1);
    expect(calcCostMenuMock.mock.calls[0]).toEqual([order.shop_id, order.menu]);
    expect(verifyOrderDataMock).toBeCalledTimes(1);
    expect(verifyOrderDataMock.mock.calls[0]).toEqual([items, order.menu, shop]);
    expect(uuidv4Mock).toBeCalledTimes(1);
    expect(createPaymentMock).toBeCalledTimes(1);
    expect(createPaymentMock.mock.calls[0]).toEqual([total_cost, order.id, 'Ваш заказ']);
    expect(createOrderMock).toBeCalledTimes(0);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ result: 'error create payment' });
  });
});

describe('DELETE /orders/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should delete orders', async () => {
    let typesOrder = ['wait_payment', 'accepted', 'coocking'];

    for (let i = 0; i < typesOrder.length; i++) {
      let deleteFn = (ActiveOrders.deleteOne = jest
        .fn()
        .mockImplementation(() => Promise.resolve([])));
      let findFn = (ActiveOrders.findOne = jest
        .fn()
        .mockImplementation(() => Promise.resolve(order)));
      let order = {
        id: '1',
        status: typesOrder[i],
      };
      const response = await request(app).delete(`/restaurant/api/orders/${order.id}`);
      expect(findFn).toBeCalledTimes(1);
      expect(findFn.mock.calls[0][0]).toEqual({ id: order.id });
      expect(deleteFn).toBeCalledTimes(1);
      expect(deleteFn.mock.calls[0][0]).toEqual({ id: order.id });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ result: 'ok' });
      jest.clearAllMocks();
    }
  });

  test('test order cannot be returned', async () => {
    let typesOrder = ['delivering', 'success', 'canseled'];

    for (let i = 0; i < typesOrder.length; i++) {
      let deleteFn = (ActiveOrders.deleteOne = jest
        .fn()
        .mockImplementation(() => Promise.resolve({})));
      let findFn = (ActiveOrders.findOne = jest
        .fn()
        .mockImplementation(() => Promise.resolve(order)));
      let order = {
        id: '1',
        status: typesOrder[i],
      };
      const response = await request(app).delete(`/restaurant/api/orders/${order.id}`);
      expect(findFn).toBeCalledTimes(1);
      expect(findFn.mock.calls[0][0]).toEqual({ id: order.id });
      expect(deleteFn).toBeCalledTimes(0);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ result: 'Order cannot be returned' });
      jest.clearAllMocks();
    }
  });
});
