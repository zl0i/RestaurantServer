import { Users } from '../../entity/user'
import { In } from 'typeorm'
import BasicScope from './basicScope'

export default class OrderScope extends BasicScope {
    constructor(user: Users) {
        super(user)
    }

    me(): object {
        return { id_user: this._user.id }
    }

    points(ids: Array<number>): object {
        return { id_point: In(ids) }
    }
}