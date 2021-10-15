import { Users } from "../../entity/user"
import { Resources, Scopes } from "../../lib/permissionsBuilder"
import BasicScope, { ICondition } from "./basicScope"
import MenuScope from "./menuScope"
import OrderScope from "./orderScope"
import PointScope from "./pointScope"
import UserScope from "./userScope"


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
        this._scope = obj.object as Scopes //TO DO 
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
                return new PointScope()
            default:
                throw new Error('ScopeBuilder: undefined resource ' + this._resource)
        }
    }

    getCondition(): ICondition {
        const sclass = this.createScopeClass()
        switch (this._scope) {
            case Scopes.own:
                return sclass.own()
            case Scopes.points:
                return sclass.points(this._params)
            case Scopes.all:
                return { key: '', value: [] }
            default:
                throw new Error('ScopeBuilder: undefined scope ' + this._scope)
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
            params: scope.slice(start + 1, end).split(',').map((el) => el.trim())
        }
    }
}