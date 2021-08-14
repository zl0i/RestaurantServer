import app from "../server";
import request from "supertest";
import OAuthFlow from "../src/oauthFlow";
import { Users } from "../entity/user";
import PermissionsBuilder from "../lib/permissionsBuilder";
import { vk_users } from "../entity/vk_users";
import { Tokens } from "../entity/tokens";

describe('/oauth', () => {

    test('vk flow', async () => {
        const response = await request(app)
            .get('/restaurant/api/oauth?method=vk&device=web')

        const url = new URL(response.headers.location)
        const params = new URLSearchParams(url.searchParams)
        expect(response.statusCode).toBe(302)
        expect(url.hostname).toBe('oauth.vk.com')
        expect(params.get('redirect_uri')).toBe('https://zloi.space/restaurant/api/oauth/code')
        expect(params.get('state')).toBe('vk')
        expect(params.get('client_id')).toBeTruthy()
    })

    test('yandex flow', async () => {
        const response = await request(app)
            .get('/restaurant/api/oauth?method=yandex&device=web')

        const url = new URL(response.headers.location)
        const params = new URLSearchParams(url.searchParams)
        expect(response.statusCode).toBe(302)
        expect(url.hostname).toBe('oauth.yandex.ru')
        expect(params.get('redirect_uri')).toBe('https://zloi.space/restaurant/api/oauth/code')
        expect(params.get('state')).toBe('ya')
        expect(params.get('client_id')).toBeTruthy()
    })
})

describe('/oauth/code', () => {

    test('right way', async () => {

        OAuthFlow.requstInfoVk = jest.fn().mockReturnValue(Promise.resolve({}))
        Users.prototype.save = jest.fn().mockReturnValue(Promise.resolve())
        PermissionsBuilder.setUserRolePermissions = jest.fn().mockReturnValue(Promise.resolve())
        PermissionsBuilder.createTokenPermissionsByUser = jest.fn().mockReturnValue(Promise.resolve())
        vk_users.insert = jest.fn().mockReturnValue(Promise.resolve())
        Tokens.prototype.save = jest.fn().mockReturnValue(Promise.resolve())


        const response = await request(app)
            .get('/restaurant/api/oauth/code?code=1&state=vk')

        const url = new URL(response.headers.location)
        const params = new URLSearchParams(url.searchParams)
        expect(response.statusCode).toBe(302)
        expect(url.hostname).toBe('zloi.space')
        expect(params.get('token')).toBeTruthy()
        expect(OAuthFlow.requstInfoVk).toBeCalledTimes(1)
        expect(Users.prototype.save).toBeCalledTimes(1)
        expect(vk_users.insert).toBeCalledTimes(1)
        expect(Tokens.prototype.save).toBeCalledTimes(1)
        expect(PermissionsBuilder.setUserRolePermissions).toBeCalledTimes(1)
        expect(PermissionsBuilder.createTokenPermissionsByUser).toBeCalledTimes(1)

    })
})