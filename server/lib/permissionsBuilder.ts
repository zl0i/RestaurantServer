import { user_permissions } from "../entity/user_permissions.entity"
import { token_permissions } from '../entity/token_permissions.entity';
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export enum UserRoles {
    guest,
    client,
    point_admin,
    //network_admin,
    admin,
    custom
}

export const enum Resources {
    points = 'points',
    menu = 'menu',
    users = 'users',
    orders = 'orders',
    category = 'category',
    warehouses = 'warehouses'
}

export enum Actions {
    create = 'create',
    read = 'read',
    update = 'update',
    delete = 'delete'
}

export const enum Scopes {
    orders = 'orders',
    points = 'points',
    own = 'own',
    all = 'all'
}

export default class PermissionsBuilder {
    constructor() { }

    //TODO: if roles are issued than do nothing
    static async setUserRolePermissions(id_user: number, role: UserRoles) {
        await user_permissions.delete({ id_user: id_user })

        const permissions: PermissionSet = new PermissionSet();

        switch (role) {
            case UserRoles.admin:
                permissions.add(Resources.users)
                permissions.add(Resources.orders)
                permissions.add(Resources.points)
                permissions.add(Resources.menu)
                permissions.add(Resources.warehouses)
                break;
            /*case UserRoles.point_admin:
                permissions.add(Resources.orders)
                permissions.add(Resources.points)
                permissions.add(Resources.menu)
                break;*/
            case UserRoles.client:
                permissions.add(Resources.users, Actions.read, Scopes.own)
                permissions.add(Resources.users, Actions.update, Scopes.own)
                permissions.add(Resources.points, Actions.read)
                permissions.add(Resources.menu, Actions.read)
                permissions.add(Resources.orders, Actions.create)
                permissions.add(Resources.orders, Actions.read, Scopes.own)
                break;
            case UserRoles.guest:
                permissions.add(Resources.points, Actions.read, Scopes.all, ['users'])
                permissions.add(Resources.menu, Actions.read, Scopes.all, ['recipe'])
                break;
            default:
                throw new Error('PermissionsBuilder: undefinde role ' + role)
        }

        const user_permission = new Array;
        for (const p of permissions) {
            user_permission.push({
                id_user: id_user,
                ...p
            })
        }
        await user_permissions.insert(user_permission as QueryDeepPartialEntity<user_permissions>[])
    }

    static async createTokenPermissionsByUser(id_user: number, id_token: number) {
        const permissions = await user_permissions.find({ id_user: id_user })
        for (const p of permissions) {
            await token_permissions.insert({
                id_token: id_token,
                resource: p.resource,
                action: p.action,
                scope: p.scope,
                conditions: p.conditions
            })
        }
    }
}


export class PermissionSet {

    private obj: object = {};

    public add(resource: Resources, action?: Actions, scope: Scopes = Scopes.all, forbidFields: string[] = []) {
        if (!this.obj[resource]) {
            this.obj[resource] = {}
        }
        if (action) {
            this.obj[resource][action] = {
                scope,
                forbidFields
            }
        } else {
            this.obj[resource][Actions.create] = {
                scope,
                forbidFields: []
            }
            this.obj[resource][Actions.read] = {
                scope,
                forbidFields: []
            }
            this.obj[resource][Actions.update] = {
                scope,
                forbidFields: []
            }
            this.obj[resource][Actions.delete] = {
                scope,
                forbidFields: []
            }
        }
    }

    public [Symbol.iterator]() {
        const arr = Object.keys(this.obj).map((resource: any) => {
            return Object.keys(this.obj[resource]).map((action: any) => {
                return { resource, action, scope: this.obj[resource][action].scope, forbid_fields: JSON.stringify(this.obj[resource][action].forbidFields) }
            })
        }).flat()
        const iterrator = arr[Symbol.iterator]()
        return iterrator
    }
}


