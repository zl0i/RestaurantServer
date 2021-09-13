import { Users } from "../../entity/user";
import BasicScope, { ICondition } from "./basicScope";

export default class UserScope extends BasicScope {
    constructor(user: Users) {
        super(user)
    }

    own(): ICondition {
        return { key: 'id', value: [this._user.id] }
    }

    points(ids: Array<number>): ICondition {
        return { key: 'id_point', value: ids }
    }
}