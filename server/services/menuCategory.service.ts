

import { UploadedFile } from "express-fileupload"
import Menu from "../entity/menu"
import MenuCategory from "../entity/menu_category"
import HttpError from "../lib/httpError"
import { ICondition } from "../middleware/scopes/basicScope"
import ObjectStorage from "../src/storage"




export default class MenuCategoryService {

    static async read(icondition: ICondition) {

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
        const menu = await Menu.find({ category: id })
        if (menu.length > 0) {
            throw new HttpError(400, 'Category isn\'t empty')
        }
        const category = await MenuCategory.findOne({ id })
        if (category.icon)
            await ObjectStorage.deleteImage(category.icon)
        await category.remove()
    }
}