
import Menu from "../entity/menu.entity"
import { ICondition } from "../middleware/scopes/basicScope"
import HttpError from "../lib/httpError"
import AdditionsCategory from "../entity/additions_category.entity"
import { In } from "typeorm"



export default class AdditionsCategoryService {

    static async read(icondition: ICondition) {

    }

    static async create(data: any) {
        const menu = await Menu.find({ id: In(data.ids_menu as number[]) })
        if (menu.length === data.ids_menu.length) {
            const item = new AdditionsCategory()
            item.name = data.name
            item.menu = menu
            item.mode = data.mode
            return await item.save()
        } else {
            throw new HttpError(400, 'Dish not found')
        }
    }

    static async update(id: number, data: any) {
        const item = await AdditionsCategory.findOne({ id })
        item.name = data.name || item.name
        item.mode = data.mode || item.mode
        if (data.ids_menu) {
            const menu = await Menu.find({ id: In(data.ids_menu as number[]) })
            if (menu.length === data.ids_menu.length) {
                item.menu = menu
            } else {
                throw new HttpError(400, 'Dish not found')
            }
        }
        return await item.save()
    }

    static async delete(id: number) {
        const result = await AdditionsCategory.delete({ id })
        if (result.affected == 0)
            throw new HttpError(400, 'AdditionsCategory not found')

        return result
    }
}