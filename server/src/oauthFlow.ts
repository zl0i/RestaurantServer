import express from 'express'
import axios from 'axios';
import qs from 'querystring';
import jwt from 'jsonwebtoken';
import { vk_users } from '../entity/vk_users';
import { ya_users } from '../entity/ya_users';
import PermissionsBuilder from '../lib/permissionsBuilder';
import { Users } from '../entity/user';
import { Tokens } from '../entity/tokens';

const google_client_id = "7891752"

const vk_client_id = "7891752";
const vk_redirect_uri = "https://zloi.space/restaurant/api/oauth/code";
const vk_client_secret = process.env['VK_CLIENT_SECRET'];

const ya_client_id = "e843c0ced9934cb3b39ee73ed8f1958a";
const ya_client_secret = process.env['YA_CLIENT_SECRET'];

const secret_key = process.env['APP_SECRET'] || 'shhhh'

interface IUserInfo {
    id: string
    access_token: string,
    refresh_token: string
    token_expired: number,

    login: string,
    name: string
    lastname: string,
    birthday: Date,
    phone: string,
    email: string
}

export default class OAuthFlow {


    static async redirectUser(req: express.Request, res: express.Response) {
        try {
            let url: string;
            const method: string = String(req.query['method'])
            const device: string = String(req.query['device'])
            switch (method) {
                case "google":
                    url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&response_type=code&access_type=offline&scope=https://www.googleapis.com/auth/user.emails.read profile`
                    break;
                case "vk":
                    url = `https://oauth.vk.com/authorize?client_id=${vk_client_id}&display=page&scope=offline&response_type=code&v=5.131&state=vk`
                    break;
                case "yandex":
                    url = `https://oauth.yandex.ru/authorize?client_id=${ya_client_id}&response_type=code&state=ya`
                    break;
                default: {
                    res.redirect("https://zloi.space?error=method_undefined")
                }
            }
            switch (device) {
                case "web":
                    url = url + `&redirect_uri=${vk_redirect_uri}`
                    break;
                default: {
                    res.redirect("https://zloi.space?error=device_undefined")
                    return;
                }
            }
            res.redirect(url);
        } catch (e) {
            console.log(e.message)
            res.redirect("https://zloi.space?error=method_undefined1");
        }
    }

    static async handleCode(req: express.Request, res: express.Response) {
        try {
            const code = String(req.query['code']);
            let info: IUserInfo;
            switch (req.query['state']) {
                case 'vk':
                    info = await OAuthFlow.requstInfoVk(code)
                    break;
                case 'ya':
                    info = await OAuthFlow.requstInfoYandex(code)
                    break;
                default:
                    res.redirect(`https://zloi.space?message=error`)
                    break;
            }

            const user = new Users()
            user.name = info.name;
            user.lastname = info.lastname
            user.phone = info.phone
            user.verify_phone = true
            user.birthday = info.birthday
            //TO DO if phone is undefined, than permission is guest and redirect to request phone page 
            await user.save()
            PermissionsBuilder.createRolePermissions(user.id, "client")

            switch (req.query['state']) {
                case 'vk':
                    await vk_users.insert({
                        id: info.id,
                        id_user: user.id,
                        login: info.login,
                        refresh_token: info.refresh_token,
                        access_token: info.access_token,

                    })
                    break;
                case 'ya':
                    await ya_users.insert({
                        id: info.id,
                        id_user: user.id,
                        login: info.login,
                        refresh_token: info.refresh_token,
                        access_token: info.access_token,

                    })
                    break;
            }
            const token = new Tokens()
            token.id_user - user.id
            token.token = jwt.sign({ id_user: user.id }, secret_key)
            await token.save()
            PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)

            res.redirect(`https://zloi.space?token=${token.token}`)
        } catch (error) {
            console.log(error.message)
            res.status(500).end();
        }
    }

    static async requstInfoVk(code: string): Promise<IUserInfo> {
        const token = await axios.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: vk_client_id,
                client_secret: vk_client_secret,
                redirect_uri: vk_redirect_uri,
                code: code
            }
        });
        const info = await axios.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: token.data.user_id,
                fields: 'verified,bdate,photo_id,city,connections,contacts,domain',
                access_token: token.data.access_token,
                v: '5.131'
            }
        });
        return {
            id: token.data.user_id,
            access_token: token.data.access_token,
            refresh_token: "",
            token_expired: -1,

            login: info.data.response[0].domain,
            name: info.data.response[0].first_name,
            lastname: info.data.response[0].last_name,
            birthday: new Date(info.data.response[0].bdate),
            phone: info.data.response[0].phone,
            email: ""
        }
    }

    static async requstInfoYandex(code: string): Promise<IUserInfo> {
        const token = await axios.post('https://oauth.yandex.ru/token', qs.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: ya_client_id,
            client_secret: ya_client_secret
        }));

        const info = await axios.get('https://login.yandex.ru/info', {
            headers: {
                format: 'json',
                with_openid_identity: 1,
                Authorization: `OAuth ${token.data.access_token}`
            }
        });

        return {
            id: info.data.id,
            access_token: token.data.access_token,
            refresh_token: token.data.refresh_token,
            token_expired: token.data.expires_in,

            login: info.data.login,
            name: info.data.first_name,
            lastname: info.data.last_name,
            birthday: new Date(info.data.birthday),
            email: info.data.default_email,
            phone: info.data.phone
        }
    }
}