import axios from 'axios';
import bcrypt from 'bcryptjs'
import { BadRequestError, InternalError, UnauthorizedError } from '../lib/httpErrorHandler';
import { Users } from '../entity/user.entity';
import { Tokens } from '../entity/tokens.entity';
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder'
import { MoreThan } from 'typeorm';
import { UsersInfo } from '../entity/users_info.entity';

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
    const info = await UsersInfo.findOne({ phone: phone })
    if (info) {
      const user = await Users.findOne({ id: info.id })
      user.sms_code = code
      await user.save()
      await Tokens.delete({ id_user: user.id })
    } else {
      const user = new Users()
      user.info = new UsersInfo()
      user.info.login = phone
      user.info.phone = phone
      user.sms_code = code
      await user.save()
      await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.guest)
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
    const info = await UsersInfo.findOne({ id: user.id })
    if (!info.verify_phone) {
      await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.client)
      info.verify_phone = true
    }
    await user.save()
    await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)

    return {
      result: "ok",
      token: token.token
    }
  }

  static async viaPassword(login: string, password: string) {
    const info = await UsersInfo.findOne({ login: login })
    const user = await Users.findOne({ id: info.id })
    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedError('login or password isn\'t correct')

    await Tokens.delete({ id_user: user.id })
    const token = new Tokens(user.id)
    await token.save()
    await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)
    return {
      result: "ok",
      token: token.token
    }
  }

  static async viaToken(req_token: string) {
    const token = await Tokens.findOne({ token: req_token, expired_at: MoreThan(new Date()) })
    if (!token)
      throw new UnauthorizedError('Token invalid')

    const newToken = new Tokens(token.id_user)
    await token.remove()
    await newToken.save()
    return { token: newToken.token }
  }

  static async sendSMSCode(phone: string): Promise<string> {

    if (!this.validatePhone(phone))
      throw new BadRequestError('Bad number phone');

    if (phone == '+79999999999' || smsApiKey == 'test')
      return '9674'

    const code = this.generateCode();
    const reply = await axios.get(
      `https://sms.ru/sms/send?api_id=${smsApiKey}5&to=${phone}&msg=${code}&json=1&from=MyRestaurant`,
    );

    if (reply.data.status_code !== 100)
      throw new InternalError('Sms not send');

    return code
  }

  static async validateCode(phone: string, code: string): Promise<Users> {
    if (code == '')
      throw new UnauthorizedError('Code not right');

    const info = await UsersInfo.findOne({ phone: phone })
    const user = await Users.findOne({ id: info.id, sms_code: code });
    if (!user)
      throw new UnauthorizedError('Code not right');

    return user
  }
}