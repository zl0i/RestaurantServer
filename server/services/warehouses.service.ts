import { In } from "typeorm"
import Points from "../entity/points.entity"
import Warehouses from "../entity/warehouses.entity"
import { NotFoundError } from "../lib/errors"
import { ICondition } from "../middleware/scopes/basicScope"



export default class WarehousesService {

    static async read(icondition: ICondition) {

    }

    static async create(data: any) {
        const points = await Points.find({ id: In(data.ids_points as number[]) })
        if (points.length === data.ids_points.length) {
            const item = new Warehouses()
            item.name = data.name
            item.address = data.address
            item.lat = data.lat
            item.lon = data.lon
            item.points = points
            return await item.save()
        } else {
            throw new NotFoundError('Points not found')
        }
    }

    static async update(id: number, data: any) {
        const points = await Points.find({ id: In(data.ids_points as number[]) })
        if (points.length === data.ids_points.length) {
            const item = await Warehouses.findOne({ id })
            item.name = data.name ?? item.name
            item.address = data.address ?? item.address
            item.lat = data.lat ?? item.lat
            item.lon = data.lon ?? item.lon
            item.points = points ?? item.points
            return await item.save()
        } else {
            throw new NotFoundError('Points not found')
        }
    }

    static async delete(id: number) {
        const result = await Warehouses.delete({ id })
        if (result.affected == 0)
            throw new NotFoundError('Warehouse not found')

        return result
    }
}