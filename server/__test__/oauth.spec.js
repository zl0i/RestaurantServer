//const axios = require('axios').default;
const oauthFlow = require('../src/oauth')

jest.mock('axios');

describe('Test OAuthFlow redirect', () => {
    const req = {
        query: {
            method: "",
            device: "web"
        }
    }
    const res = {
        redirect: jest.fn().mockImplementation(() => { return; }),
        json: jest.fn().mockImplementation(() => { return; }),
        end: jest.fn().mockImplementation(() => { return; })
    }

    afterEach(() => {
        jest.clearAllMocks();
    })


    test('vk right way', () => {
        req.query.method = 'vk';

        oauthFlow.redirectUser(req, res);

        expect(res.redirect).toBeCalledTimes(1);
        const url = new URL(res.redirect.mock.calls[0][0])
        const params = new URLSearchParams(url.searchParams)
        expect(url.hostname).toBe('oauth.vk.com')
        expect(params.get('redirect_uri')).toBe('https://zloi.space/restaurant/api/oauth/code')
        expect(params.get('state')).toBe('vk')
        expect(params.get('client_id')).toBeTruthy()
    })


    test('yandex right way', () => {
        req.query.method = 'yandex'

        oauthFlow.redirectUser(req, res);

        expect(res.redirect).toBeCalledTimes(1);
        const url = new URL(res.redirect.mock.calls[0][0])
        const params = new URLSearchParams(url.searchParams)
        expect(url.hostname).toBe('oauth.yandex.ru')
        expect(params.get('redirect_uri')).toBe('https://zloi.space/restaurant/api/oauth/code')
        expect(params.get('state')).toBe('ya')
        expect(params.get('client_id')).toBeTruthy()
    })

    /*test('method undefined', () => {
        req.query = { device: 'web' };

        const res = {
            redirect: jest.fn().mockImplementation(function () {
                return;
            })
        }
        oauthFlow.redirectUser(req, res);

        const url = new URL(res.redirect.mock.calls[0][0])  
        //const url2 = new URL(res.redirect.mock.calls[1][0])       
        console.log(res.redirect.mock.calls[1]);
        expect(res.redirect).toBeCalledTimes(1);
        expect(url.hostname).toBe('zloi.space');
    })*/

    test('device undefined', () => {

    })


    /*test('user for yandex', () => {
        req.query.method = "yandex";
        req.query.device = "web";

        oauthFlow.redirectUser(req, res);

        expect(res.redirect).toBeCalledTimes(1);
        const url = new URL(res.redirect.mock.calls[0][0])
        const params = new URLSearchParams(url.searchParams)
        expect(url.hostname).toBe('oauth.yandex.ru')
        expect(params.get('redirect_uri')).toBe('https://zloi.space/restaurant/api/oauth/code')
        expect(params.get('state')).toBe('ya')
        expect(params.get('client_id')).toBeTruthy()
    })*/
})

/*describe('Test OAuthFlow get user info', () => {
    test('vk', async () => {
        const code = '12345679'
        const token = {
            data: {

            }
        }

        const info = {
            data: {
                response: [
                    {
                        domain: "test",
                        first_name: "first",
                        last_name: "last"
                    }
                ]
            }
        }

        axios.get.mockImplementationOnce(() => Promise.resolve(token))
            .mockImplementationOnce(() => Promise.resolve(info))

        const user = await oauthFlow.requstInfoVk(code)

        expect(user.firstname).toBe(info.data.response[0].first_name)


    })


})*/



