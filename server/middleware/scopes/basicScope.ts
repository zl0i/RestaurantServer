
export interface ICondition {
    key: string,
    value: Array<number>
}

export default abstract class BasicScope {
    constructor() { }    

    abstract own(): ICondition
    abstract points(ids: Array<number>): ICondition
}