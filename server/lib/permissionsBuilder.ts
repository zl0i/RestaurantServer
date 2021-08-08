import { user_permissions } from "../entity/user_permissions"
import { token_permissions } from '../entity/token_permissions';
import { Tokens } from "../entity/tokens";



export default class PermissionsBuilder {
    constructor() { }

    static async createRolePermissions(id_user: number, role: string) { //TO DO create enum

        switch (role) {
            case 'guest':
                await user_permissions.insert([
                    { id_user: id_user, resource: 'users', action: 'get', scope: 'me' },
                    { id_user: id_user, resource: 'points', action: 'get' },
                    { id_user: id_user, resource: 'menu', action: 'get' },
                ])
                break;
            case 'client':
                await user_permissions.insert([           //TO DO update permission for old users        
                    { id_user: id_user, resource: 'orders', action: 'create' },
                    { id_user: id_user, resource: 'orders', action: 'get', scope: 'me' },
                    { id_user: id_user, resource: 'orders', action: 'update', scope: 'me' },
                    { id_user: id_user, resource: 'orders', action: 'delete', scope: 'me' },
                ])
                break;

            case 'admin':
                await user_permissions.insert([           
                    { id_user: id_user, resource: 'users', action: 'create' },
                    { id_user: id_user, resource: 'users', action: 'get' },
                    { id_user: id_user, resource: 'users', action: 'delete' },
                    { id_user: id_user, resource: 'orders', action: 'create' },
                    { id_user: id_user, resource: 'orders', action: 'get' },
                    { id_user: id_user, resource: 'orders', action: 'update' },
                    { id_user: id_user, resource: 'orders', action: 'delete' },
                    { id_user: id_user, resource: 'points', action: 'get' },
                    { id_user: id_user, resource: 'menu', action: 'get' },
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

    static async deleteTokenByUser(id_user: number) {
        const token = await Tokens.findOne({ id_user: id_user })
        if (token) {
            await token_permissions.delete({ id_token: token.id })
            token.remove()
        }
    }

}