const request = require('supertest');
const { app } = require('../server');
const Address = require('../models/addressModel');

describe('Test get address', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('get address', async () => {
    let fn = (Address.find = jest.fn().mockImplementationOnce(() => Promise.resolve([])));

    const response = await request(app).get('/restaurant/api/address');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
    expect(fn).toBeCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({});
  });

  test('error get address', async () => {
    let fn = (Address.find = jest.fn().mockImplementationOnce(() => Promise.reject()));

    const response = await request(app).get('/restaurant/api/address');
    expect(response.statusCode).toBe(500);
    expect(fn).toBeCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({});
  });
});
