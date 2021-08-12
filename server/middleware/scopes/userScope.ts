import { In } from "typeorm";
import { Users } from "../../entity/user";
import BasicScope from "./basicScope";

export default class UserScope extends BasicScope {
    constructor(user: Users) {
        super(user)
    }

    me(): object {
        return { id: this._user.id }
    }

    points(ids: Array<number>): object {
        return { id_point: In(ids) }
    }
}