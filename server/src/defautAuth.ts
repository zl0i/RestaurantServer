import axios from 'axios';
import express from 'express'
import bcrypt from 'bcryptjs'
import HttpError from '../lib/httpError';
import { Users } from '../entity/user';
import { Tokens } from '../entity/tokens';
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder'
import { MoreThan } from 'typeorm';
import { user_permissions } from '../entity/user_permissions';
import { token_permissions } from '../entity/token_permissions';

const smsApiKey = process.env['APP_SMS_API_KEY'] || '';


export default class DefaultAuth {

  static validatePhone(phone: string): boolean {
    if (/\+7[0-9]{10}/.test(phone))
      return true;

    return false;
  }

  static generateCode(): string {
    return Number(Math.round(Math.random() * 8999 + 1000)).toString()
  }

  static async viaPhone(req: express.Request, res: express.Response) {
    try {
      const phone: string = req.body.phone
      const code: string = await DefaultAuth.sendSMSCode(phone)
      const user = await Users.findOne({ phone: phone })

      if (user) {
        user.sms_code = code
        await user.save()
        await Tokens.delete({ id_user: user.id })
      } else {
        const newUsers = new Users()
        newUsers.phone = phone
        newUsers.sms_code = code
        await newUsers.save()
        PermissionsBuilder.setUserRolePermissions(newUsers.id, UserRoles.guest)
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
      const permissions = await user_permissions.find({ id_user: user.id })
      const token = new Tokens(user.id, PermissionsBuilder.compressPermissions(permissions.map(p => `${p.resource}:${p.action}:${p.scope}`)))
      await token.save()

      user.sms_code = ''
      if (!user.verify_phone) {
        await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.client)
        user.verify_phone = true
      }
      await user.save()
      await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)

      res.json({
        result: "ok",
        token: token.token
      })
    } catch (error) {
      console.log(error)
      res.status(error.status).json({
        result: 'error',
        message: error.message
      })
    }
  }

  static async viaPassword(req: express.Request, res: express.Response) {
    try {
      const user = await Users.findOne({ login: req.body.login })
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        await Tokens.delete({ id_user: user.id })
        const permissions = await user_permissions.find({ id_user: user.id })
        const token = new Tokens(user.id, PermissionsBuilder.compressPermissions(permissions.map(p => `${p.resource}:${p.action}:${p.scope}`)))
        await token.save()
        await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)
        res.json({
          result: "ok",
          token: token.token
        })
      } else {
        res.status(401).json({
          result: 'error',
          message: 'login or password isn\'t correct'
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }

  static async viaToken(req: express.Request, res: express.Response) {
    try {
      const token = await Tokens.findOne({ token: req.headers.authorization?.split(" ")[1], expired_at: MoreThan(new Date()) })
      if (token) {
        const permissions = await token_permissions.find({ id_token: token.id })
        const newToken = new Tokens(token.id_user, PermissionsBuilder.compressPermissions(permissions.map(p => `${p.resource}:${p.action}:${p.scope}`)))
        await token.remove()
        await newToken.save()
        res.json({
          token: newToken.token
        })
      } else {
        res.status(401).end()
      }
    } catch (error) {
      res.status(500).end()
    }
  }



  static async sendSMSCode(phone: string): Promise<string> {
    if (phone == '+79999999999' || smsApiKey == 'test')
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