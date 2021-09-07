import express from 'express'
import axios from 'axios';
import qs from 'querystring';
import jwt from 'jsonwebtoken';
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder';
import { Users } from '../entity/user';
import { Tokens } from '../entity/tokens';
import { oauth_users } from '../entity/oauth_users';

const redirect_uri = "https://zloi.space/restaurant/api/oauth/code";
const project_uri = "https://gossy.link"

const google_client_id = "335026942851-6sueatn9m6hgdasg9tsm2djmq2k3fgl8.apps.googleusercontent.com"
const google_client_secret = process.env['GOOGLE_CLIENT_SECRET'];
const google_scopes = "https://www.googleapis.com/auth/profile.emails.read https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/user.gender.read"
const google_api_key = process.env["GOOGLE_API_KEY"]

const vk_client_id = "7891752";
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
                    url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&response_type=code&access_type=offline&scope=${google_scopes}&state=go`
                    break;
                case "vk":
                    url = `https://oauth.vk.com/authorize?client_id=${vk_client_id}&display=page&scope=offline&response_type=code&v=5.131&state=vk`
                    break;
                case "yandex":
                    url = `https://oauth.yandex.ru/authorize?client_id=${ya_client_id}&response_type=code&state=ya`
                    break;
                default: {
                    res.redirect(`${project_uri}?error=method_undefined`)
                }
            }
            switch (device) {
                case "web":
                    url = url + `&redirect_uri=${redirect_uri}`
                    break;
                default: {
                    res.redirect(`${project_uri}?error=device_undefined`)
                    return;
                }
            }
            res.redirect(url);
        } catch (e) {
            console.log(e.message)
            res.redirect(`${project_uri}?error=method_undefined`);
        }
    }

    static async handleCode(req: express.Request, res: express.Response) {
        try {
            const code = req.query['code'] as string;
            let info: IUserInfo;
            switch (req.query['state'] as string) {
                case 'vk':
                    info = await OAuthFlow.requstInfoVk(code)
                    break;
                case 'ya':
                    info = await OAuthFlow.requstInfoYandex(code)
                    break;
                case 'go':
                    info = await OAuthFlow.requstInfoGoogle(code)
                    console.log(info)
                    break;
                case 'df':
                    info = OAuthFlow.defaultInfo()
                    break;
                default:
                    res.redirect(`${project_uri}?message=error`)
                    break;
            }

            //TO DO if phone is undefined, than permission is guest and redirect to request phone page
            const oauth_user = await oauth_users.findOne({ oauth_id: info.id, service: req.query['state'] as string })
            let user: Users
            if (oauth_user) {
                user = await Users.findOne({ id: oauth_user.id_user })
            } else {
                user = new Users()
                user.name = info.name;
                user.lastname = info.lastname
                user.phone = info.phone
                user.verify_phone = true
                user.birthday = info.birthday
                await user.save()
                await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.client)
                await oauth_users.insert({
                    oauth_id: info.id,
                    id_user: user.id,
                    login: info.login,
                    refresh_token: info.refresh_token,
                    access_token: info.access_token,
                    service: req.query['state'] as string
                })
            }

            const token = new Tokens()
            token.id_user = user.id
            token.token = jwt.sign({ id_user: user.id }, secret_key)
            await token.save()
            PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)

            res.redirect(`https://gossy.link?token=${token.token}`)
        } catch (error) {
            console.log(error)
            res.status(500).end();
        }
    }

    static async requstInfoVk(code: string): Promise<IUserInfo> {
        const token = await axios.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: vk_client_id,
                client_secret: vk_client_secret,
                redirect_uri: redirect_uri,
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

    static async requstInfoGoogle(code: string): Promise<IUserInfo> {
        const token = await axios.post('https://oauth2.googleapis.com/token', {
            params: {
                grant_type: 'authorization_code',
                code: code,
                client_id: google_client_id,
                client_secret: google_client_secret,
                redirect_uri: redirect_uri
            }
        });
        console.log(token.status, token.data)
        const info = await axios.get('https://people.googleapis.com/v1/people/me', {
            headers: {
                key: google_api_key,
                personFields: 'birthdays,names,genders,emailAddresses,phoneNumbers',
                Authorization: `Bearer ${token.data.access_token}`
            }
        });
        console.log(info.status, info.data)
        const date = info.data.birthdays[0].date
        return {
            id: info.data.names[0].metadata.source.id,
            access_token: token.data.access_token,
            refresh_token: token.data.refresh_token,
            token_expired: token.data.expires_in,

            login: '', 
            name: info.data.names[0].givenName,
            lastname: info.data.names[0].familyName,
            birthday: new Date(date.year, date.month, date.day),
            email: info.data.emailAddresses[0].value,
            phone: ''
        }
    }

    static defaultInfo(): IUserInfo {
        return {
            id: "694225478",
            access_token: "example_access_token",
            refresh_token: "example_refresh_token",
            token_expired: -1,

            login: 'example_login',
            name: 'example_name',
            lastname: 'example_lastname',
            birthday: new Date(),
            email: 'example@mail.com',
            phone: '+79999999999'
        }
    }
}