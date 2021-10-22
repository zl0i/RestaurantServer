import { Users } from "../../entity/user";
import BasicScope, { ICondition } from "./basicScope";

export default class UserScope extends BasicScope {
    constructor(user: Users) {
        super()
        this._user = user
    }

    private _user: Users

    own(): ICondition {
        return { key: 'id', value: [this._user.id] }
    }

    points(ids: Array<number>): ICondition {
        return { key: 'id_point', value: ids }
    }

    orders(ids: Array<number>): ICondition {
        return { key: 'id_user', value: ids }
    }
}