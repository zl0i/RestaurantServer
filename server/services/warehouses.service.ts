import { In } from "typeorm"
import Points from "../entity/points.entity"
import Warehouses from "../entity/warehouses.entity"
import WarehousesGoods from "../entity/warehouse_goods.entity"
import { BadRequestError, NotFoundError } from "../lib/errors"
import { ICondition } from "../middleware/scopes/basicScope"



export default class WarehousesService {

    static async read(icondition: ICondition) {

    }

    static async create(data: any) {
        const points = await Points.find({ id: In(data.ids_points as number[]) })
        if (points.length !== data.ids_points.length)
            throw new NotFoundError('Points not found')

        const item = new Warehouses()
        item.name = data.name
        item.address = data.address
        item.lat = data.lat
        item.lon = data.lon
        item.points = points
        return await item.save()

    }

    static async update(id: number, data: any) {
        const points = await Points.find({ id: In(data.ids_points as number[]) })
        if (points.length !== data.ids_points.length)
            throw new NotFoundError('Points not found')

        const item = await Warehouses.findOne({ id })
        item.name = data.name ?? item.name
        item.address = data.address ?? item.address
        item.lat = data.lat ?? item.lat
        item.lon = data.lon ?? item.lon
        item.points = points ?? item.points
        return await item.save()
    }

    static async updateCountGood(id_warehouse: number, id_good: number, data: any) {
        let wh_good = await WarehousesGoods.findOne({ id_warehouse, id_good })

        if (wh_good && wh_good.unit != data.unit)
            throw new BadRequestError('Units should equals')


        if (!wh_good) {
            wh_good = new WarehousesGoods()
            wh_good.id_good = id_good
            wh_good.id_warehouse = id_warehouse
            wh_good.unit = data.unit
            wh_good.count = 0
        }
        wh_good.count += data.count
        if (wh_good.count == 0) {
            wh_good.remove()
            return { result: 'ok', message: 'Good count is zero' }
        } else if (wh_good.count < 0) {
            throw new BadRequestError('The quantity cannot be less than zero')
        }

        return await wh_good.save()
    }

    static async delete(id: number) {
        const result = await Warehouses.delete({ id })
        if (result.affected == 0)
            throw new NotFoundError('Warehouse not found')

        return result
    }
}