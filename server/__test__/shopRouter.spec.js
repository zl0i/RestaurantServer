const request = require('supertest');
const { app, server } = require('../main');
const mongoose = require('mongoose');
const yookassa = require('../src/yokassaAPI');
const Shop = require('../models/shopsModel');

yookassa.startCheckStatusPayments = jest.fn();
mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());

afterAll(() => {
  server.close();
});

describe('GET /shop', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get all shops', async () => {
    let fn = (Shop.find = jest.fn().mockImplementation(() => Promise.resolve([])));

    const response = await request(app).get('/azia/api/shops');
    expect(fn).toBeCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({});
    expect(response.statusCode).toBe(200);
  });

  test('should error on find shop', async () => {
    let fn = (Shop.find = jest.fn().mockImplementation(() => Promise.reject()));

    const response = await request(app).get('/azia/api/shops');
    expect(fn).toBeCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({});
    expect(response.statusCode).toBe(500);
  });
});
