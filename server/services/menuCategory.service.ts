

import { UploadedFile } from "express-fileupload"
import { FindManyOptions } from "typeorm"
import Menu from "../entity/menu.entity"
import MenuCategory from "../entity/menu_category.entity"
import { BadRequestError, NotFoundError } from "../lib/httpErrorHandler"
import { Serializer } from "../lib/Serializer"
import ObjectStorage from "../src/storage"




export default class MenuCategoryService {

    static async read(options: FindManyOptions<MenuCategory>) {
        return Serializer.serialize(await MenuCategory.find(options), await MenuCategory.count(options))
    }

    static async create(data: any) {
        const category = new MenuCategory()
        category.name = data.name
        category.id_point = Number(data.id_point)
        category.description = data.description
        await category.save()
        if (data.icon) {
            const file = data.icon as UploadedFile
            category.icon = await ObjectStorage.uploadImage(file, category.id) as string
            await category.save()
        }
        return category
    }

    static async update(id: number, data: any) {
        const category = await MenuCategory.findOne({ id })
        category.name = data.name || category.name
        category.description = data.description || category.description
        if (data.icon) {
            const file = data.icon as UploadedFile
            category.icon = await ObjectStorage.replaceImage(category.icon, file, category.id) as string
        }
        return await category.save()
    }

    static async delete(id: number) {
        const menu = await Menu.find({ id_category: id })
        if (menu.length > 0) {
            throw new BadRequestError('Category isn\'t empty')
        }
        const category = await MenuCategory.findOne({ id })
        if (!category)
            throw new NotFoundError('Category not found')

        if (category.icon)
            await ObjectStorage.deleteImage(category.icon)

        return await category.remove()
    }
}