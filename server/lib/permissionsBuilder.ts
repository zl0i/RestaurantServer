import { user_permissions } from "../entity/user_permissions"
import { token_permissions } from '../entity/token_permissions';
import { Tokens } from "../entity/tokens";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

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
        let stringScope = ''

        if (scope) {
            const resource = Object.keys(scope)[0]
            stringScope = `${resource}[${scope[resource].join(',')}]`
        }

        await user_permissions.delete({ id_user: id_user })

        let permission: any = {};

        switch (role) {
            case UserRoles.admin:
                permission.users = {
                    'create': { scope: "" },
                    'read': { scope: "" },
                    'update': { scope: "" },
                    'delete': { scope: "" }
                }
                permission.orders = {
                    'create': { scope: "" },
                    'read': { scope: "" },
                    'update': { scope: "" },
                    'delete': { scope: "" }
                }
                permission.points = {
                    'create': { scope: "" },
                    'read': { scope: "" },
                    'update': { scope: "" },
                    'delete': { scope: "" }
                }
                permission.menu = {
                    'create': { scope: "" },
                    'read': { scope: "" },
                    'update': { scope: "" },
                    'delete': { scope: "" }
                }
                break;
            case UserRoles.point_admin:
                permission.orders = {
                    'create': { scope: stringScope },
                    'read': { scope: stringScope },
                    'update': { scope: stringScope },
                    'delete': { scope: stringScope }
                }
                permission.points = {
                    'read': { scope: stringScope },
                    'update': { scope: stringScope }
                }
                permission.menu = {
                    'create': { scope: stringScope },
                    'read': { scope: stringScope },
                    'update': { scope: stringScope },
                    'delete': { scope: stringScope }
                }
                break;
            case UserRoles.client:
                permission.orders = {
                    'create': { scope: "" },
                    'read': { scope: 'own' },
                }
                permission.users = {
                    'read': { scope: "own" }
                }
            case UserRoles.guest:
                permission.points = {
                    'read': { scope: '' }
                }
                permission.menu = {
                    'read': { scope: '' }
                }
        }

        const user_permission = Object.keys(permission).map((resource: any) => {
            return Object.keys(permission[resource]).map((action: any) => {
                return { id_user: id_user, resource, action, scope: permission[resource][action].scope }
            })
        })
        await user_permissions.insert(user_permission.flat() as QueryDeepPartialEntity<user_permissions>[])
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