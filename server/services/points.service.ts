
import { UploadedFile } from "express-fileupload"
import Points from "../entity/points.entity"
import { NotFoundError } from "../lib/httpErrorHandler"
import ObjectStorage from "../src/storage"
import { FindManyOptions, In } from "typeorm"
import { Serializer } from "../lib/Serializer"
import { Users } from "../entity/user.entity"


export default class PointService {

    static async read(options: FindManyOptions<Points>) {
        return Serializer.serialize(await Points.find(options), await Points.count(options))
    }

    static async create(data: any) {
        const point = new Points()
        point.name = data.name
        point.address = data.address
        point.lat = data.lat
        point.lon = data.lon
        point.delivery_cost = data.delivery_cost || 0
        point.is_delivering = data.is_delivering == 'true'

        if (data.ids_users) {
            const users = await Users.find({ id: In(JSON.parse(data.ids_users) as number[]) })
            if (users.length !== data.ids_users.length)
                throw new NotFoundError('Users not found')
            point.users = users
        }

        await point.save()
        if (data.icon) {
            const file = data.icon as UploadedFile
            point.icon = await ObjectStorage.uploadImage(file as UploadedFile, point.id) as string
            await point.save()
        }
        return point
    }

    static async update(id: number, data: any) {
        const point = await Points.findOne({ id })
        if (!point)
            throw new NotFoundError('Point not found')
            
        point.name = data.name || point.name
        point.address = data.address || point.address
        point.lat = data.lat || point.lat
        point.lon = data.lon || point.lon
        point.delivery_cost = data.delivery_cost || point.delivery_cost
        point.is_delivering = data.is_delivering == 'true' || point.is_delivering
        if (data.icon) {
            const file = data.icon as UploadedFile
            point.icon = await ObjectStorage.uploadImage(file as UploadedFile, point.id) as string
        }
        if (data.ids_users) {
            const ids_users = JSON.parse(data.ids_users)
            const users = await Users.find({ id: In(ids_users as number[]) })
            if (users.length !== ids_users.length)
                throw new NotFoundError('Users not found')
            point.users = users
        }
        return await point.save()
    }

    static async delete(id: number) {
        const point = await Points.findOne({ id })
        if (!point)
            throw new NotFoundError('Point not found')

        if (point.icon)
            await ObjectStorage.deleteImage(point.icon)

        return await point.remove()
    }
}