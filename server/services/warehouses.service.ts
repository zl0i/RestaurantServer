import { FindManyOptions, In } from "typeorm"
import Points from "../entity/points.entity"
import { Users } from "../entity/user.entity"
import Warehouses from "../entity/warehouses.entity"
import WarehousesGoods from "../entity/warehouse_goods.entity"
import { BadRequestError, NotFoundError } from "../lib/httpErrorHandler"
import { Serializer } from "../lib/Serializer"



export default class WarehousesService {

    static async read(options: FindManyOptions<Warehouses>) {
        return Serializer.serialize(await Warehouses.find(options), await Warehouses.count(options))
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

        if (data.ids_users) {
            const users = await Users.find({ id: In(data.ids_users as number[]) })
            if (users.length !== data.ids_users.length)
                throw new NotFoundError('Users not found')
            item.users = users
        }
        return await item.save()
    }

    static async update(id: number, data: any) {
        const item = await Warehouses.findOne({ id })
        if (!item)
            throw new NotFoundError('Warehouse not found')
            
        item.name = data.name ?? item.name
        item.address = data.address ?? item.address
        item.lat = data.lat ?? item.lat
        item.lon = data.lon ?? item.lon

        if (data.ids_points) {
            const points = await Points.find({ id: In(data.ids_points as number[]) })
            if (points.length !== data.ids_points.length)
                throw new NotFoundError('Points not found')
            item.points = points ?? item.points
        }
        if (data.ids_users) {
            const users = await Users.find({ id: In(data.ids_users as number[]) })
            if (users.length !== data.ids_users.length)
                throw new NotFoundError('Users not found')
            item.users = users
        }
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
        const goods = await WarehousesGoods.find({ id_warehouse: id })
        if (goods.length > 0)
            throw new BadRequestError('Warehouse not empty')

        const result = await Warehouses.delete({ id })
        if (result.affected == 0)
            throw new NotFoundError('Warehouse not found')

        return result
    }
}