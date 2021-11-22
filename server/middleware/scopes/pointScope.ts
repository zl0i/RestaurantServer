import { createQueryBuilder, In } from "typeorm";
import Points from "../../entity/points.entity";
import { Users } from "../../entity/user.entity";
import BasicScope, { ICondition } from "./basicScope";

export default class PointScope extends BasicScope {
    constructor(user: Users) {
        super()
        this.user = user
    }

    private user: Users

    async own(): Promise<ICondition<Points>> {
        const points = await createQueryBuilder()
            .select('id_point')
            .from('users_points', 'up')
            .where('id_user = :id', { id: this.user.id })
            .getRawMany();
        const point_ids = points.map(item => item.id_point) ?? []
        return {
            findCondition: { id: In(point_ids) },
            key: 'id',
            value: point_ids
        }
    }

    async points(ids: number[]): Promise<ICondition<Points>> {
        return {
            findCondition: { id: In(ids) },
            key: 'id',
            value: ids
        }
    }

    async orders(ids: number[]): Promise<ICondition<Points>> {
        return {
            findCondition: {},
            key: '',
            value: []
        }
    }

    async warehouses(ids: number[]): Promise<ICondition<Points>> {
        const wh = await createQueryBuilder()
            .select('id_point')
            .from('warehouses_points', 'wp')
            .where('id_warehouse IN (:...id)', { id: ids })
            .getRawMany();
        const point_ids = wh.map(item => item.id_point)
        return {
            findCondition: { id: In(point_ids) },
            key: 'id',
            value: point_ids
        }
    }
}