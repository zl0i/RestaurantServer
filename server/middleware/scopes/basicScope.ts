import { Users } from "../../entity/user";

export interface ICondition {
    key: string,
    value: Array<number>
}

export default abstract class BasicScope {
    constructor(user: Users) {
        this._user = user
    }

    protected _user: Users

    abstract me(): ICondition
    abstract points(ids: Array<number>): ICondition
}