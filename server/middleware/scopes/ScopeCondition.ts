import { BaseEntity } from "typeorm"
import { Users } from "../../entity/user.entity"
import { Resources, Scopes } from "../../lib/permissionsBuilder"
import BasicScope, { ICondition } from "./basicScope"
import MenuScope from "./menuScope"
import OrderScope from "./orderScope"
import PointScope from "./pointScope"
import UserScope from "./userScope"
import WarehouseScope from "./warehouseScope"


interface IScope {
    object: string,
    params: Array<any>
}

export default class ScopeCondition {

    private _user: Users
    private _resource: Resources
    private _scope: Scopes
    private _params: Array<number>

    constructor(rs: Resources, scope: string, user: Users) {
        this._resource = rs
        this._user = user
        const obj = ScopeCondition.parseScope(scope)
        this._scope = obj.object as Scopes
        this._params = obj.params
    }

    private createScopeClass(): BasicScope {
        switch (this._resource) {
            case Resources.orders:
                return new OrderScope(this._user)
            case Resources.users:
                return new UserScope(this._user)
            case Resources.menu:
                return new MenuScope()
            case Resources.points:
                return new PointScope(this._user)
            case Resources.warehouses:
                return new WarehouseScope(this._user)
            default:
                throw new Error('ScopeBuilder: undefined resource ' + this._resource)
        }
    }

    async getCondition(): Promise<ICondition<BaseEntity>> {
        const sclass = this.createScopeClass()
        switch (this._scope) {
            case Scopes.own:
                return sclass.own()
            case Scopes.points:
                return await sclass.points(this._params)
            case Scopes.orders:
                return await sclass.orders(this._params)
            case Scopes.warehouses:
                return await sclass.warehouses(this._params)
            case Scopes.all:
                return {
                    findCondition: {},
                    key: '',
                    value: []
                }
            default:
                throw new Error('ScopeBuilder: undefined scope: ' + this._scope)
        }
    }

    static parseScope(scope: string): IScope {
        let start = scope.indexOf('[')
        let end = scope.indexOf(']')

        if (start == -1) {
            return {
                object: scope,
                params: []
            }
        }

        return {
            object: scope.slice(0, start),
            params: scope.slice(start + 1, end).split(',').map((el) => Number(el.trim()))
        }
    }
}