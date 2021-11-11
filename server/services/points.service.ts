
import { UploadedFile } from "express-fileupload"
import Points from "../entity/points"
import { ICondition } from "../middleware/scopes/basicScope"
import ObjectStorage from "../src/storage"



export default class PointService {

    static async read(_icondition: ICondition) {

    }

    static async create(data: any) {
        const point = new Points()
        point.name = data.name
        point.address = data.address
        point.lat = data.lat
        point.lon = data.lon
        point.delivery_cost = data.delivery_cost || 0
        point.is_delivering = data.is_delivering == 'true'
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
        return await point.save()
    }

    static async delete(id: number) {
        const point = await Points.findOne({ id })
        return await point.remove()
    }
}