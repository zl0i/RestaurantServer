import BasicScope, { ICondition } from './basicScope'

export default class MenuScope extends BasicScope {
    constructor() {
        super()
    }

    own(): ICondition {
        return { key: '', value: [] }
    }

    points(ids: Array<number>): ICondition {
        return { key: 'id_point', value: ids }
    }

    orders(_ids: Array<number>): ICondition {
        return { key: '', value: [] }
    }
}
