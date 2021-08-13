import { user_permissions } from "../entity/user_permissions"
import { token_permissions } from '../entity/token_permissions';
import { Tokens } from "../entity/tokens";

export enum UserRoles {
    guest,
    client,
    point_admin,
    //network_admin,
    admin,
    custom
}

export interface IScope {
    point?: Array<number>,
    own?: boolean
}
// TO DO get rename to read
export default class PermissionsBuilder {
    constructor() { }

    static async setUserRolePermissions(id_user: number, role: UserRoles, scope?: IScope) { //TO DO if roles are issued than do nothing
        await user_permissions.delete({ id_user: id_user })

        if (scope) {
            const resource = Object.keys(scope)[0]
            const stringScope = `${resource}[${scope[resource].join(',')}]`
            console.log(stringScope)
        }

        switch (role) {
            case UserRoles.guest:
                await user_permissions.insert([
                    { id_user: id_user, resource: 'users', action: 'get', scope: 'me' },
                    { id_user: id_user, resource: 'points', action: 'get' },
                    { id_user: id_user, resource: 'menu', action: 'get' },
                ])
                break;
            case UserRoles.client:
                await user_permissions.insert([
                    { id_user: id_user, resource: 'orders', action: 'create' },
                    { id_user: id_user, resource: 'orders', action: 'get', scope: 'me' },
                    { id_user: id_user, resource: 'orders', action: 'update', scope: 'me' },
                    { id_user: id_user, resource: 'orders', action: 'delete', scope: 'me' },
                ])
                break;
            case UserRoles.point_admin:
                await user_permissions.insert([
                    { id_user: id_user, resource: 'users', action: 'get', scope: 'points[1]' },
                    { id_user: id_user, resource: 'orders', action: 'create' },
                    { id_user: id_user, resource: 'orders', action: 'get' },
                    { id_user: id_user, resource: 'orders', action: 'update' },
                    { id_user: id_user, resource: 'orders', action: 'delete' },
                    { id_user: id_user, resource: 'points', action: 'get' },
                    { id_user: id_user, resource: 'points', action: 'update' },
                    { id_user: id_user, resource: 'menu', action: 'create' },
                    { id_user: id_user, resource: 'menu', action: 'updates' },
                    { id_user: id_user, resource: 'menu', action: 'get' },
                    { id_user: id_user, resource: 'menu', action: 'delete' },
                ])
                break;
            case UserRoles.admin:
                await user_permissions.insert([
                    { id_user: id_user, resource: 'users', action: 'create' },
                    { id_user: id_user, resource: 'users', action: 'get' },
                    { id_user: id_user, resource: 'users', action: 'delete' },
                    { id_user: id_user, resource: 'orders', action: 'create' },
                    { id_user: id_user, resource: 'orders', action: 'get' },
                    { id_user: id_user, resource: 'orders', action: 'update' },
                    { id_user: id_user, resource: 'orders', action: 'delete' },
                    { id_user: id_user, resource: 'points', action: 'get' },
                    { id_user: id_user, resource: 'points', action: 'update' },
                    { id_user: id_user, resource: 'menu', action: 'create' },
                    { id_user: id_user, resource: 'menu', action: 'update' },
                    { id_user: id_user, resource: 'menu', action: 'get' },
                    { id_user: id_user, resource: 'menu', action: 'delete' },
                ])
                break;
        }
    }

    static async createCustomPermissionsUser(id_user: number, permissions: user_permissions[]) {
        permissions.forEach(async (el) => {
            await user_permissions.insert({
                id_user: id_user,
                resource: el.resource,
                action: el.action,
                scope: el.scope,
                conditions: el.conditions
            })
        })
    }

    static async createTokenPermissionsByUser(id_user: number, id_token: number) {
        const permissions = await user_permissions.find({ id_user: id_user })
        permissions.forEach(async (el) => {
            await token_permissions.insert({
                id_token: id_token,
                resource: el.resource,
                action: el.action,
                scope: el.scope,
                conditions: el.conditions
            })
        })
    }

    static async deleteTokenByUserId(id_user: number) {
        const token = await Tokens.findOne({ id_user: id_user })
        if (token) {
            await token_permissions.delete({ id_token: token.id })
            token.remove()
        }
    }

}