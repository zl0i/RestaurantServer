import { Users } from "../../entity/user";

export default abstract class BasicScope {
    constructor(user: Users) {
        this._user = user
    }

    protected _user: Users

    abstract me(): object
    abstract points(ids: Array<number>): object
}