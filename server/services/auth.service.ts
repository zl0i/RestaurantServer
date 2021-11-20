import axios from 'axios';
import bcrypt from 'bcryptjs'
import { DomainError, InternalError, UnauthorizedError } from '../lib/errors';
import { Users } from '../entity/user.entity';
import { Tokens } from '../entity/tokens.entity';
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder'
import { MoreThan } from 'typeorm';

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

  static async viaPhone(phone: string) {
    const code: string = await DefaultAuth.sendSMSCode(phone)
    const user = await Users.findOne({ phone: phone })
    if (user) {
      user.sms_code = code
      await user.save()
      await Tokens.delete({ id_user: user.id })
    } else {
      const newUsers = new Users()
      newUsers.login = phone
      newUsers.phone = phone
      newUsers.sms_code = code
      await newUsers.save()
      PermissionsBuilder.setUserRolePermissions(newUsers.id, UserRoles.guest)
    }
    return {
      result: 'ok'
    }
  }

  static async viaCode(phone: string, code: string) {
    const user = await DefaultAuth.validateCode(phone, code)
    const token = new Tokens(user.id)
    await token.save()

    user.sms_code = ''
    if (!user.verify_phone) {
      await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.client)
      user.verify_phone = true
    }
    await user.save()
    await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)

    return {
      result: "ok",
      token: token.token
    }
  }

  static async viaPassword(login: string, password: string) {
    const user = await Users.findOne({ login })
    if (user && bcrypt.compareSync(password, user.password)) {
      await Tokens.delete({ id_user: user.id })
      const token = new Tokens(user.id)
      await token.save()
      await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)
      return {
        result: "ok",
        token: token.token
      }
    } else {
      throw new UnauthorizedError('login or password isn\'t correct')
    }
  }

  static async viaToken(req_token: string) {
    const token = await Tokens.findOne({ token: req_token, expired_at: MoreThan(new Date()) })
    if (token) {
      const newToken = new Tokens(token.id_user)
      await token.remove()
      await newToken.save()
      return { token: newToken.token }
    } else {
      throw new UnauthorizedError('token is not valid')
    }
  }



  static async sendSMSCode(phone: string): Promise<string> {

    if (!this.validatePhone(phone))
      throw new DomainError('bad number phone');

    if (phone == '+79999999999' || smsApiKey == 'test')
      return '9674'

    const code = this.generateCode();
    const reply = await axios.get(
      `https://sms.ru/sms/send?api_id=${smsApiKey}5&to=${phone}&msg=${code}&json=1&from=MyRestaurant`,
    );

    if (reply.data.status_code === 100) {
      return code
    } else {
      throw new InternalError('Sms not send');
    }
  }

  static async validateCode(phone: string, code: string): Promise<Users> {
    if (code == '')
      throw new UnauthorizedError('Code not right');

    const user = await Users.findOne({ phone: phone, sms_code: code });
    //TODO: refractor
    if (user) {
      return user;
    } else {
      throw new UnauthorizedError('Code not right');
    }
  }
}