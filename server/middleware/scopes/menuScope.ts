import { Users } from '../../entity/user'
import { In } from 'typeorm'
import BasicScope from './basicScope'

export default class MenuScope extends BasicScope {
    constructor(user: Users) {
        super(user)
    }

    me(): object {
        return {}
    }

    points(ids: Array<number>): object {
        return { id_point: In(ids) }
    }
}
