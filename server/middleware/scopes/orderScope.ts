import { In } from 'typeorm'
import Orders from '../../entity/orders.entity'
import { Users } from '../../entity/user.entity'
import BasicScope, { ICondition } from './basicScope'

export default class OrderScope extends BasicScope {
    constructor(user: Users) {
        super()
        this.user = user
    }

    private user: Users

    async own(): Promise<ICondition<Orders>> {
        const orders = await Orders.find({ select: ['id'], where: { id_user: this.user.id } })
        return {
            findCondition: { id_user: this.user.id },
            key: 'id',
            value: orders.map(item => item.id)
        }
    }

    async points(_ids: number[]): Promise<ICondition<Orders>> {
        return {
            findCondition: {},
            key: '',
            value: []
        }
    }

    async orders(ids: number[]): Promise<ICondition<Orders>> {
        return {
            findCondition: { id: In(ids) },
            key: 'id',
            value: ids
        }
    }

    async warehouses(_ids: number[]) {
        return {
            findCondition: {},
            key: '',
            value: []
        }
    }
}
