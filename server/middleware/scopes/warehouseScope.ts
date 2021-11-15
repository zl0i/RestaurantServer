//import { createQueryBuilder } from "typeorm";
import BasicScope, { ICondition } from "./basicScope";

export default class WarehouseScope extends BasicScope {
    constructor() {
        super()
    }

    own(): ICondition {
        return { key: '', value: [] }
    }

    //TODO: get wh by point
    points(ids: Array<number>): ICondition {
        /*const wh = await createQueryBuilder()
            .select('id_warehouse')
            .from('warehouses_points', 'wp')
            .where('id_point IN (:...id)', { id: [3] })
            .getRawMany();*/
        return { key: '', value: [] }
    }

    orders(ids: Array<number>): ICondition {
        return { key: '', value: [] }
    }
}