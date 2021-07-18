const axios = require('axios').default;
const User = require('../models/userModel');
const qs = require('querystring');
const jwt = require('jsonwebtoken');

const google_client_id = "7891752"

const vk_client_id = "7891752";
const vk_redirect_uri = "https://zloi.space/restaurant/api/oauth/code";
const vk_client_secret = process.env.VK_CLIENT_SECRET;

const ya_client_id = "e843c0ced9934cb3b39ee73ed8f1958a";
const ya_client_secret = process.env.YA_CLIENT_SECRET;

class OAuthFlow {

    static async redirectUser(req, res) {
        try {
            let url;
            const method = req.query.method
            const device = req.query.device
            switch (method) {
                case "google":
                    url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&response_type=code&access_type=offline&state=ya&scope=https://www.googleapis.com/auth/user.emails.read profile`
                    break;
                case "vk":
                    url = `https://oauth.vk.com/authorize?client_id=${vk_client_id}&display=page&scope=offline&response_type=code&v=5.131&state=vk`
                    break;
                case "yandex":
                    url = `https://oauth.yandex.ru/authorize?client_id=${ya_client_id}&response_type=code`
                    break;
                default:
                    res.status(400).end()
            }
            switch (device) {
                case "web":
                    url += `&redirect_uri=${vk_redirect_uri}`
                    break;
                default:
                    res.status(400).end()
            }
            res.redirect(url);
        } catch (e) {
            console.log(e.message)
            res.status(500).end();
        }
    }

    static async handleCode(req, res) {
        try {
            const code = req.query.code;
            let info = {}
            switch (req.query.state) {
                case 'vk':
                    info = await OAuthFlow.requstInfoVk(code)
                    break;
                case 'ya':
                    info = await OAuthFlow.requstInfoYandex(code);
                    break;
                default:
                    res.redirect(`https://zloi.space?message=error`)
                    break;
            }

            let user = new User();
            Object.assign(user, info);
            user.jwt_token = jwt.sign({ id: 1 }, 'shhhhh');
            user.save();

            res.redirect(
                `https://zloi.space?token=${user.jwt_token}&firstname=${user.firstname}`
            )
        } catch (error) {
            console.log(error.message)
            res.status(500).end();
        }
    }

    static async requstInfoVk(code) {
        const token = await axios.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: vk_client_id,
                client_secret: vk_client_secret,
                redirect_uri: vk_redirect_uri,
                code: code
            }
        });
        console.log(token)
        const info = await axios.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: token.data.user_id,
                fields: 'verified,bdate,photo_id,city,connections,contacts,domain',
                access_token: token.data.access_token,
                v: '5.131'
            }
        });
        return {
            vk_id: token.data.user_id,
            vk_access_token: token.data.access_token,
            vk_refresh_token: "",
            vk_token_expired: -1,

            login: info.data.response[0].domain,
            firstname: info.data.response[0].first_name,
            lastname: info.data.response[0].last_name,
            birthday: new Date(info.data.response[0].bdate)
        }
    }

    static async requstInfoYandex(code) {
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
            ya_id: info.data.id,
            ya_access_token: token.data.access_token,
            ya_refresh_token: token.data.refresh_token,
            ya_token_expired: token.data.expires_in,

            login: info.data.login,
            firstname: info.data.first_name,
            lastname: info.data.last_name,
            birthday: new Date(info.data.birthday),
            email: info.data.default_email
        }
    }
}

module.exports = OAuthFlow;