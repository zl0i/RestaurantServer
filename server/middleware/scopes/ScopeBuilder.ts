import { Users } from "../../entity/user"
import BasicScope from "./basicScope"
import OrderScope from "./orderScope"
import UserScope from "./userScope"


interface Scope {
    object: string,
    params: Array<any>
}

export default class ScopeBuilder {

    private _user: Users
    private _resource: string
    private _scopeClass: BasicScope
    private _scope: string
    private _params: Array<number>

    constructor() {
    }

    resource(rs: string): ScopeBuilder {
        this._resource = rs
        return this
    }

    user(user: Users): ScopeBuilder {
        this._user = user
        return this
    }

    scope(scope: string): ScopeBuilder {
        const obj = ScopeBuilder.parseScope(scope)
        this._scope = obj.object
        this._params = obj.params
        return this
    }

    init(): ScopeBuilder {
        switch (this._resource) {
            case 'orders':
                this._scopeClass = new OrderScope(this._user)
                break;
            case 'users':
                this._scopeClass = new UserScope(this._user)
                break;
            default:
                throw new Error('undefined resource: ' + this._resource)
        }
        return this
    }

    build(): object {
        switch (this._scope) {
            case 'me':
                return this._scopeClass.me()
            case 'points':
                return this._scopeClass.points(this._params)
            default:
                return {}
        }
    }


    static parseScope(scope: string): Scope {
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