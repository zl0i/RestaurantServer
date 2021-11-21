import { createQueryBuilder, In } from 'typeorm'
import Menu from '../../entity/menu.entity'
import BasicScope, { ICondition } from './basicScope'

export default class MenuScope extends BasicScope {
    constructor() {
        super()
    }

    override async own() {
        return {
            findCondition: {},
            key: '',
            value: []
        }
    }

    override async points(ids: number[]): Promise<ICondition<Menu>> {
        const menu = await createQueryBuilder()
            .select('m.id')
            .from('menu', 'm')
            .leftJoin('menu_category', 'mc', 'm.id_category = mc.id')
            .leftJoin('points', 'p', 'p.id = mc.id_point')
            .where('p.id IN (:...id)', { id: ids })
            .getRawMany();
        const menu_ids = menu.map(item => item.m_id)
        return {
            findCondition: { id: In(menu_ids) },
            key: 'id',
            value: menu_ids
        }
    }

    async orders(_ids: number[]) {
        return {
            findCondition: {},
            key: '',
            value: []
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
