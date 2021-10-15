import BasicScope, { ICondition } from "./basicScope";

export default class PointScope extends BasicScope {
    constructor() {
        super()
    }

    own(): ICondition {
        return { key: '', value: [] }
    }

    points(_ids: Array<number>): ICondition {
        return { key: '', value: [] }
    }
}