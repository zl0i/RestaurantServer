import { createQueryBuilder, In } from "typeorm";
import { Users } from "../../entity/user.entity";
import Warehouses from "../../entity/warehouses.entity";
import BasicScope, { ICondition } from "./basicScope";

export default class WarehouseScope extends BasicScope {
    constructor(user: Users) {
        super()
        this.user = user
    }

    private user: Users

    async own(): Promise<ICondition<Warehouses>> {
        const wh = await createQueryBuilder()
            .select('id_warehouse')
            .from('users_warehouses', 'uw')
            .where('id_user = :id', { id: this.user.id })
            .getRawMany();
        const wh_ids = wh.map(item => item.id_warehouse)
        return {
            findCondition: { id: In(wh_ids) },
            key: 'id',
            value: wh_ids
        }
    }

    async points(ids: number[]): Promise<ICondition<Warehouses>> {
        const wh = await createQueryBuilder()
            .select('id_warehouse')
            .from('warehouses_points', 'wp')
            .where('id_point IN (:...id)', { id: ids })
            .getRawMany();
        const wh_ids = wh.map(item => item.id_warehouse)
        return {
            findCondition: { id: In(wh_ids) },
            key: 'id',
            value: wh_ids
        }
    }

    async orders(_ids: number[]): Promise<ICondition<Warehouses>> {
        return {
            findCondition: {},
            key: '',
            value: []
        }
    }

    async warehouses(ids: number[]): Promise<ICondition<Warehouses>> {
        return {
            findCondition: { id: In(ids) },
            key: 'id',
            value: ids
        }
    }
}