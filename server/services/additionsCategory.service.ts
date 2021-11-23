
import Menu from "../entity/menu.entity"
import { NotFoundError } from "../lib/httpErrorHandler"
import AdditionsCategory from "../entity/additions_category.entity"
import { FindManyOptions, In } from "typeorm"
import { Serializer } from "../lib/Serializer"



export default class AdditionsCategoryService {

    static async read(options: FindManyOptions<AdditionsCategory>) {
        return Serializer.serialize(await AdditionsCategory.find(options), await AdditionsCategory.count(options))
    }

    static async create(data: any) {
        const menu = await Menu.find({ id: In(data.ids_menu as number[]) })
        if (menu.length !== data.ids_menu.length)
            throw new NotFoundError('Dish not found')

        const item = new AdditionsCategory()
        item.name = data.name
        item.menu = menu
        item.mode = data.mode
        return await item.save()
    }

    static async update(id: number, data: any) {
        const item = await AdditionsCategory.findOne({ id })
        item.name = data.name || item.name
        item.mode = data.mode || item.mode
        if (data.ids_menu) {
            const menu = await Menu.find({ id: In(data.ids_menu as number[]) })
            if (menu.length !== data.ids_menu.length)
                throw new NotFoundError('Dish not found')

            item.menu = menu
        }
        return await item.save()
    }

    static async delete(id: number) {
        const result = await AdditionsCategory.delete({ id })
        if (result.affected == 0)
            throw new NotFoundError('AdditionsCategory not found')

        return result
    }
}