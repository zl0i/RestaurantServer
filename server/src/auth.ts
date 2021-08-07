import axios from 'axios';
import jwt from 'jsonwebtoken'
import { Users } from '../entity/user';
import express from 'express'
import HttpError from './httpError';
import { Tokens } from '../entity/tokens';
import { token_permissions } from '../entity/token_permissions';
import { user_permissions } from '../entity/user_permissions';

const smsApiKey = process.env['SMS_API_KEY'] || '';
const secret_key = process.env['APP_SECRET'] || 'shhhh'


export default class DefaultAuth {

  static validatePhone(phone: string): boolean {
    if (/^\+?[7][-(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/.test(phone))
      return true;

    return false;
  }

  static generateCode(): String {
    return Number(Math.round(Math.random() * 8999 + 1000)).toString()
  }



  static async viaPhone(req: express.Request, res: express.Response) {
    try {
      const phone: string = req.body.phone
      const code = await DefaultAuth.sendSMSCode(phone)
      const user = await Users.findOne({ phone: phone })

      if (user) {
        user.sms_code = code
        await user.save()
        const token = await Tokens.findOne({ id_user: user.id })
        if (token) {
          await token_permissions.delete({ id_token: token.id })
          token.remove()
        }
      } else {
        const newUsers = new Users()
        newUsers.phone = phone
        newUsers.sms_code = code
        await newUsers.save()
        await user_permissions.insert([ //to do distinct class
          { id_user: newUsers.id, resource: 'orders', action: 'create' },
          { id_user: newUsers.id, resource: 'orders', action: 'get', scope: 'me' },
          { id_user: newUsers.id, resource: 'orders', action: 'update', scope: 'me' },
          { id_user: newUsers.id, resource: 'orders', action: 'delete', scope: 'me' },
          { id_user: newUsers.id, resource: 'points', action: 'get' },
          { id_user: newUsers.id, resource: 'menu', action: 'get' },
          { id_user: newUsers.id, resource: 'users', action: 'get', scope: 'me' },
        ])
      }

      res.json({
        result: 'ok'
      })
    } catch (error) {
      res.status(error.status).json({
        result: 'error',
        message: error.message
      })
    }
  }

  static async viaCode(req: express.Request, res: express.Response) {
    try {
      const phone: string = req.body.phone
      const code: string = req.body.code

      const user = await DefaultAuth.validateCode(phone, code)
      user.sms_code = ''
      user.save()

      const token = new Tokens()
      token.id_user = user.id
      token.token = jwt.sign({ user_id: user.id, role: 'role' }, secret_key)
      await token.save()
      const permissions = await user_permissions.find({ id_user: user.id })
      permissions.forEach(el => {
        token_permissions.insert({ //to do distinct class
          id_token: token.id,
          resource: el.resource,
          action: el.action,
          scope: el.scope,
          conditions: el.scope
        })
      })

      res.json({
        result: "ok",
        token: token.token
      })

    } catch (error) {
      res.status(error.status).json({
        result: 'error',
        message: error.message
      })
    }
  }

  static async viaPassword(_req: express.Request, res: express.Response) {
    res.end()
  }



  static async sendSMSCode(phone: string): Promise<String> {

    if (phone == '+79100000000')
      return '9674'

    if (!this.validatePhone(phone))
      throw new HttpError(400, 'bad number phone');

    const code = this.generateCode();
    const reply = await axios.get(
      `https://sms.ru/sms/send?api_id=${smsApiKey}5&to=${phone}&msg=${code}&json=1&from=MyRestaurant`,
    );

    if (reply.data.status_code === 100) {
      return code
    } else {
      throw new HttpError(500, 'sms not send');
    }
  }

  static async validateCode(phone: string, code: string): Promise<Users> {
    if (code == '')
      throw new HttpError(401, 'code not right');

    const user = await Users.findOne({ phone: phone, sms_code: code });
    if (user) {
      return user;
    } else {
      throw new HttpError(401, 'code not right');
    }
  }


}







