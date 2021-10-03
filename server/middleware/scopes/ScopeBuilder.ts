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

export default class ScopeBuilder {

    private _user: Users
    private _resource: Resources
    private _scopeClass: BasicScope
    private _scope: Scopes
    private _params: Array<number>

    constructor() { }

    resource(rs: Resources): ScopeBuilder {
        this._resource = rs
        return this
    }

    user(user: Users): ScopeBuilder {
        this._user = user
        return this
    }

    scope(scope: string): ScopeBuilder {
        const obj = ScopeBuilder.parseScope(scope)
        this._scope = obj.object as Scopes //TO DO 
        this._params = obj.params
        return this
    }

    init(): ScopeBuilder {
        switch (this._resource) {
            case Resources.orders:
                this._scopeClass = new OrderScope(this._user)
                break;
            case Resources.users:
                this._scopeClass = new UserScope(this._user)
                break;
            case Resources.menu:
                this._scopeClass = new MenuScope(this._user)
                break;
            case Resources.points:
                this._scopeClass = new PointScope(this._user)
                break;
            default:
                throw new Error('ScopeBuilder: undefined resource ' + this._resource)
        }
        return this
    }

    build(): ICondition {
        switch (this._scope) {
            case Scopes.own:
                return this._scopeClass.own()
            case Scopes.points:
                return this._scopeClass.points(this._params)
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