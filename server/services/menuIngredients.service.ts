import { FindManyOptions } from "typeorm";
import Menu from "../entity/menu.entity";
import { MenuIngredients } from "../entity/menu_ingredients.entity";
import { BadRequestError, NotFoundError } from "../lib/httpErrorHandler";
import { Serializer } from "../lib/Serializer";


export default class MenuIngredientsService {

    static async read(options: FindManyOptions<MenuIngredients>) {
        return Serializer.serialize(await MenuIngredients.find(options), await MenuIngredients.count())
    }

    static async create(id_menu: number, data: any, append: boolean = false) {
        const item = await Menu.findOne({ id: id_menu })
        if (!append)
            await MenuIngredients.delete({ id_menu: item.id })

        for (const ingr of data) {
            const new_ingr = new MenuIngredients()
            new_ingr.id_menu = item.id
            new_ingr.count = ingr.count
            new_ingr.eatable = ingr.eatable
            new_ingr.id_good = ingr.id_good
            await new_ingr.save()
        }
        return data
    }

    static async update(id_menu: number, id_ingr: number, data: any) {
        const item = await MenuIngredients.findOne({ id: id_ingr, id_menu: id_menu })
        console.log(data.eatable)
        if (!item)
            throw new BadRequestError('Ingredients not found')

        item.id_good = data.id_good ?? item.id_good
        item.count = data.count ?? item.count
        item.eatable = data.eatable ?? item.eatable
        return await item.save()
    }

    static async delete(id_menu: number, id_ingr: number) {
        const result = await MenuIngredients.delete({ id: id_ingr, id_menu: id_menu })
        if (result.affected == 0)
            throw new NotFoundError('MenuIngredient not found')

        return result
    }
}