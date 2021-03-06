import axios from 'axios';
import qs from 'querystring';
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder';
import { Users } from '../entity/user.entity';
import { Tokens } from '../entity/tokens.entity';
import { oauth_users } from '../entity/oauth_users.entity';
import { UsersInfo } from '../entity/users_info.entity';

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

export default class OAuthService {


    static redirectUser(method: string, device: string) {
        let url: string;
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
                return `${project_uri}?error=method_undefined`
            }
        }
        switch (device) {
            case "web":
                url = url + `&redirect_uri=${redirect_uri}`
                break;
            default: {
                return `${project_uri}?error=device_undefined`
            }
        }
        return url;
    }

    static async handleCode(code: string, state: string) {
        try {
            let info: IUserInfo;
            switch (state) {
                case 'vk':
                    info = await OAuthService.requstInfoVk(code)
                    break;
                case 'ya':
                    info = await OAuthService.requstInfoYandex(code)
                    break;
                case 'go':
                    info = await OAuthService.requstInfoGoogle(code)
                    break;
                case 'df':
                    info = OAuthService.defaultInfo()
                    break;
                default:
                    return `${project_uri}?message=state_error`
            }

            //TODO: if phone is undefined, than permission is guest and redirect to request phone page
            const oauth_user = await oauth_users.findOne({ oauth_id: info.id, service: state })
            let user: Users
            if (oauth_user) {
                user = await Users.findOne({ id: oauth_user.id_user })
                user.info = await UsersInfo.findOne({id: oauth_user.id_user})
            } else {
                user = new Users()
                user.info = new UsersInfo()
                user.info.login = info.login
                user.info.name = info.name;
                user.info.lastname = info.lastname
                user.info.phone = info.phone
                user.info.verify_phone = true
                user.info.birthday = info.birthday
                await user.save()
                await PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.client)
                await oauth_users.insert({
                    oauth_id: info.id,
                    id_user: user.id,
                    login: info.login,
                    refresh_token: info.refresh_token,
                    access_token: info.access_token,
                    service: state
                })
            }

            const token = new Tokens(user.id)
            await token.save()
            await PermissionsBuilder.createTokenPermissionsByUser(user.id, token.id)
            return `${project_uri}?token=${token.token}`
        } catch (error) {
            return `${project_uri}?message=${error.message}`
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
        const token = await axios.post('https://oauth2.googleapis.com/token', qs.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: google_client_id,
            client_secret: google_client_secret,
            redirect_uri: redirect_uri
        }));
        const info = await axios.get('https://people.googleapis.com/v1/people/me', {
            headers: {
                Authorization: `Bearer ${token.data.access_token}`
            },
            params: {
                key: google_api_key,
                personFields: 'birthdays,names,genders,emailAddresses,phoneNumbers',
            }
        });
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