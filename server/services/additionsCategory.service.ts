
import Menu from "../entity/menu"
import { ICondition } from "../middleware/scopes/basicScope"
import HttpError from "../lib/httpError"
import AdditionsCategory from "../entity/additions_category"



export default class AdditionsCategoryService {

    static async read(icondition: ICondition) {

    }

    static async create(data: any) {
        const menu = await Menu.findOne({ id: data.id_menu })
        if (menu) {
            const item = new AdditionsCategory()
            item.name = data.name
            item.id_menu = menu.id
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
        if (data.id_menu) {
            const menu = await Menu.findOne({ id: data.id_menu })
            if (menu) {
                item.id_menu = menu.id
            } else {
                throw new HttpError(400, 'Dish not found')
            }
        }
        return await item.save()
    }

    static async delete(id: number) {
        await AdditionsCategory.delete({ id })
    }
}