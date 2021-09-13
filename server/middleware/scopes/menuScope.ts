import { Users } from '../../entity/user'
import BasicScope, { ICondition } from './basicScope'

export default class MenuScope extends BasicScope {
    constructor(user: Users) {
        super(user)
    }

    own(): ICondition {
        return { key: '', value: [] }
    }

    points(ids: Array<number>): ICondition {
        return { key: 'id_point', value: ids }
    }
}
