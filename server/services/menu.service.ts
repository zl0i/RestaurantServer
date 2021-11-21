
import { UploadedFile } from "express-fileupload"
import { FindManyOptions } from "typeorm"
import Menu from "../entity/menu.entity"
import MenuCategory from "../entity/menu_category.entity"
import { NotFoundError } from "../lib/errors"
import ObjectStorage from "../src/storage"



export default class MenuService {

    static async read(options: FindManyOptions<Menu>) {
        return await Menu.find(options)
    }

    static async create(data: any) {
        const category = await MenuCategory.findOne({ id: data.id_category })
        if (!category)
            throw new NotFoundError('Category not found')

        const item = new Menu()
        item.name = data.name
        item.cost = Number(data.cost)
        item.id_category = category.id
        item.description = data.description
        await item.save()
        if (data.icon) {
            const file = data.icon as UploadedFile
            item.icon = await ObjectStorage.uploadImage(file as UploadedFile, item.id) as string
            await item.save()
        }
        return item
    }

    static async update(id: number, data: any) {
        const item = await Menu.findOne({ id: id })
        item.name = data.name || item.name
        item.cost = Number(data.cost) || item.cost
        item.description = data.description || item.description
        if (data.id_category) {
            const category = await MenuCategory.findOne({ id: data.id_category })
            if (!category)
                throw new NotFoundError('Category not found')

            item.id_category = category.id
        }
        if (data.icon) {
            const file = data.icon as UploadedFile
            item.icon = await ObjectStorage.replaceImage(item.icon, file, item.id) as string
        }
        return await item.save()
    }

    static async delete(id: number) {
        const item = await Menu.findOne({ id })
        if (!item)
            throw new NotFoundError('Menu not found')

        if (item.icon)
            await ObjectStorage.deleteImage(item.icon)

        return await item.remove()
    }
}