import { Users } from '../entity/user';
import DefaultAuth from '../src/defautAuth'
import request from 'supertest'
import app from '../server'
import PermissionsBuilder from '../lib/permissionsBuilder';
import { Tokens } from '../entity/tokens';



describe('Test DefaultAuth:', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('validate phone', () => {
    expect(DefaultAuth.validatePhone('+79999999999')).toBe(true)
    expect(DefaultAuth.validatePhone('+7999999999')).toBe(false)
    expect(DefaultAuth.validatePhone('89999999999')).toBe(false)
    expect(DefaultAuth.validatePhone('+7(999)999-99-99')).toBe(false)
  })

  test('generate code', () => {
    for (let i = 0; i < 10; i++) {
      expect(DefaultAuth.generateCode()).toHaveLength(4)
    }
  })
})

describe('Test /auth/phone', () => {

  test('new user', async () => {

    Users.findOne = jest.fn().mockReturnValue(Promise.resolve(null))
    Users.prototype.save = jest.fn().mockImplementation(() => Promise.resolve())
    DefaultAuth.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    PermissionsBuilder.setUserRolePermissions = jest.fn().mockReturnValue(Promise.resolve())

    const response = await request(app)
      .post('/restaurant/api/auth/phone')
      .send({ phone: '+79100000000' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ result: 'ok' })
    expect(Users.findOne).toBeCalledTimes(1)
    expect(Users.prototype.save).toBeCalledTimes(1)
    expect(DefaultAuth.sendSMSCode).toBeCalledTimes(1)
    expect(PermissionsBuilder.setUserRolePermissions).toBeCalledTimes(1)
  })

  test('old user', async () => {
    const user = {
      id: 1,
      sms_code: '',
      save: jest.fn().mockImplementation(() => Promise.resolve())
    }
    Users.findOne = jest.fn().mockReturnValue(Promise.resolve(user))
    DefaultAuth.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    Tokens.delete = jest.fn().mockResolvedValue({})

    const response = await request(app)
      .post('/restaurant/api/auth/phone')
      .send({ phone: '+79100000000' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ result: 'ok' })
    expect(Users.findOne).toBeCalledTimes(1)
    expect(user.save).toBeCalledTimes(1)
    expect(DefaultAuth.sendSMSCode).toBeCalledTimes(1)
    expect(Tokens.delete).toBeCalledTimes(1)
  })
})


describe('/auth/code', () => {

  test('right code', async () => {
    const user = {
      id: 1,
      sms_code: '',
      verify_phone: false,
      save: jest.fn().mockImplementation(() => Promise.resolve())
    }
    DefaultAuth.validateCode = jest.fn().mockReturnValue(Promise.resolve(user))
    Tokens.prototype.save = jest.fn().mockReturnValue(Promise.resolve())
    DefaultAuth.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    PermissionsBuilder.setUserRolePermissions = jest.fn().mockReturnValue(Promise.resolve())
    PermissionsBuilder.createTokenPermissionsByUser = jest.fn().mockReturnValue(Promise.resolve())

    const response = await request(app)
      .post('/restaurant/api/auth/code')
      .send({ phone: '+79100000000', code: '9674' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(user.save).toBeCalledTimes(1)
    expect(DefaultAuth.validateCode).toBeCalledTimes(1)
    expect(PermissionsBuilder.setUserRolePermissions).toBeCalledTimes(1)
    expect(PermissionsBuilder.createTokenPermissionsByUser).toBeCalledTimes(1)
  })
})