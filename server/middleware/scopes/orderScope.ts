import { Users } from '../../entity/user'
import BasicScope, { ICondition } from './basicScope'

export default class OrderScope extends BasicScope {
    constructor(user: Users) {
        super()
        this._user = user        
    }

    private _user: Users

    own(): ICondition {
        return { key: 'id_user', value: [this._user.id] }
    }

    points(ids: Array<number>): ICondition {
        return { key: 'id_point', value: ids }
    }

    orders(ids: Array<number>): ICondition {
        return { key: 'id', value: ids }
    }
}
