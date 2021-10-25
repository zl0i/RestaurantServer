import { Users } from '../entity/user';
import AuthSrvice from '../services/auth.service'
import request from 'supertest'
import app from '../server'
import PermissionsBuilder from '../lib/permissionsBuilder';
import { Tokens } from '../entity/tokens';



describe('Test AuthSrvice:', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('validate phone', () => {
    expect(AuthSrvice.validatePhone('+79999999999')).toBe(true)
    expect(AuthSrvice.validatePhone('+7999999999')).toBe(false)
    expect(AuthSrvice.validatePhone('89999999999')).toBe(false)
    expect(AuthSrvice.validatePhone('+7(999)999-99-99')).toBe(false)
  })

  test('generate code', () => {
    for (let i = 0; i < 10; i++) {
      expect(AuthSrvice.generateCode()).toHaveLength(4)
    }
  })
})

describe('Test /auth/phone', () => {

  test('new user', async () => {

    Users.findOne = jest.fn().mockReturnValue(Promise.resolve(null))
    Users.prototype.save = jest.fn().mockImplementation(() => Promise.resolve())
    AuthSrvice.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    PermissionsBuilder.setUserRolePermissions = jest.fn().mockReturnValue(Promise.resolve())

    const response = await request(app)
      .post('/restaurant/api/auth/phone')
      .send({ phone: '+79100000000' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ result: 'ok' })
    expect(Users.findOne).toBeCalledTimes(1)
    expect(Users.prototype.save).toBeCalledTimes(1)
    expect(AuthSrvice.sendSMSCode).toBeCalledTimes(1)
    expect(PermissionsBuilder.setUserRolePermissions).toBeCalledTimes(1)
  })

  test('old user', async () => {
    const user = {
      id: 1,
      sms_code: '',
      save: jest.fn().mockImplementation(() => Promise.resolve())
    }
    Users.findOne = jest.fn().mockReturnValue(Promise.resolve(user))
    AuthSrvice.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    Tokens.delete = jest.fn().mockResolvedValue({})

    const response = await request(app)
      .post('/restaurant/api/auth/phone')
      .send({ phone: '+79100000000' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ result: 'ok' })
    expect(Users.findOne).toBeCalledTimes(1)
    expect(user.save).toBeCalledTimes(1)
    expect(AuthSrvice.sendSMSCode).toBeCalledTimes(1)
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
    AuthSrvice.validateCode = jest.fn().mockReturnValue(Promise.resolve(user))
    Tokens.prototype.save = jest.fn().mockReturnValue(Promise.resolve())
    AuthSrvice.sendSMSCode = jest.fn().mockReturnValue(Promise.resolve('4654'))
    PermissionsBuilder.setUserRolePermissions = jest.fn().mockReturnValue(Promise.resolve())
    PermissionsBuilder.createTokenPermissionsByUser = jest.fn().mockReturnValue(Promise.resolve())

    const response = await request(app)
      .post('/restaurant/api/auth/code')
      .send({ phone: '+79100000000', code: '9674' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(user.save).toBeCalledTimes(1)
    expect(AuthSrvice.validateCode).toBeCalledTimes(1)
    expect(PermissionsBuilder.setUserRolePermissions).toBeCalledTimes(1)
    expect(PermissionsBuilder.createTokenPermissionsByUser).toBeCalledTimes(1)
  })
})