import { UserPermissions } from "../entity/user_permissions.entity"
import { TokenPermissions } from '../entity/token_permissions.entity';
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export enum UserRoles {
    guest,
    client,
    point_admin,
    //network_admin,
    admin,
    custom
}

export enum Resources {
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

export enum Scopes {
    warehouses = 'warehouses',
    orders = 'orders',
    points = 'points',
    own = 'own',
    all = 'all'
}

export default class PermissionsBuilder {
    constructor() { }

    //TODO: if roles are issued than do nothing
    static async setUserRolePermissions(id_user: number, role: UserRoles) {
        await UserPermissions.delete({ id_user: id_user })

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
                permissions.add(Resources.orders, Actions.delete, Scopes.own)
                break;
            case UserRoles.guest:
                permissions.add(Resources.points, Actions.read)
                permissions.add(Resources.menu, Actions.read)
                break;
            default:
                throw new Error('PermissionsBuilder: undefinde role ' + role)
        }

        const user_permission = new Array;
        for (let p of permissions) {
            user_permission.push({
                id_user: id_user,
                ...p
            })
        }
        await UserPermissions.insert(user_permission as QueryDeepPartialEntity<UserPermissions>[])
    }

    static async setUserPermissions(id_user: number, permissions: string[]) {
        await UserPermissions.delete({ id_user: id_user })
        const user_permission = new Array()
        for (const p of permissions) {
            const fields = p.split(':')
            user_permission.push({
                id_user: id_user,
                resource: fields[0],
                action: fields[1],
                scope: fields[2]
            })
        }
        await UserPermissions.insert(user_permission as QueryDeepPartialEntity<UserPermissions>[])
    }

    static async createTokenPermissionsByUser(id_user: number, id_token: number) {
        const permissions = await UserPermissions.find({ id_user: id_user })
        for (const p of permissions) {
            await TokenPermissions.insert({
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

    public add(resource: Resources, action?: Actions, scope: Scopes = Scopes.all) {
        if (!this.obj[resource]) {
            this.obj[resource] = {}
        }
        if (action) {
            this.obj[resource][action] = scope
        } else {
            this.obj[resource][Actions.create] = scope
            this.obj[resource][Actions.read] = scope
            this.obj[resource][Actions.update] = scope
            this.obj[resource][Actions.delete] = scope
        }
    }

    public [Symbol.iterator]() {
        const arr = Object.keys(this.obj).map((resource: any) => {
            return Object.keys(this.obj[resource]).map((action: any) => {
                return { resource, action, scope: this.obj[resource][action] }
            })
        }).flat()
        const iterrator = arr[Symbol.iterator]()
        return iterrator
    }
}


