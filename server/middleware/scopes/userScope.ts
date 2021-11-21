import { createQueryBuilder, In } from "typeorm";
import { Users } from "../../entity/user.entity";
import BasicScope, { ICondition } from "./basicScope";

export default class UserScope extends BasicScope {
    constructor(user: Users) {
        super()
        this.user = user
    }

    private user: Users

    async own(): Promise<ICondition<Users>> {
        return {
            findCondition: { id: this.user.id },
            key: 'id',
            value: [this.user.id]
        }
    }

    async points(ids: number[]): Promise<ICondition<Users>> {
        const points = await createQueryBuilder()
            .select('id_user')
            .from('users_points', 'up')
            .where('id_point IN (:...id)', { id: ids })
            .getRawMany();
        const user_ids = points.map(item => item.id_user) ?? []
        return {
            findCondition: { id: In(user_ids) },
            key: 'id',
            value: user_ids
        }
    }

    async orders(ids: number[]): Promise<ICondition<Users>> {
        const orders = await createQueryBuilder()
            .select('id_user')
            .from('orders', 'o')
            .where('id IN (:...id)', { id: ids })
            .getRawMany();
        const user_ids = orders.map(item => item.id_user) ?? []
        return {
            findCondition: { id: In(user_ids) },
            key: 'id',
            value: user_ids
        }
    }

    async warehouses(ids: number[]): Promise<ICondition<Users>> {
        const wh = await createQueryBuilder()
            .select('id_user')
            .from('users_warehouses', 'uw')
            .where('id_warehouse IN (:...id)', { id: ids })
            .getRawMany();
        const user_ids = wh.map(item => item.id_user) ?? []
        return {
            findCondition: { id: In(user_ids) },
            key: 'id',
            value: user_ids
        }
    }
}