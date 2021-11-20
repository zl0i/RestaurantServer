import Additions from "../entity/additions.entity";
import { AdditionsIngredients } from "../entity/additions_ingredients.entity";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { ICondition } from "../middleware/scopes/basicScope";


export default class AdditionsIngredientsService {

    static async read(icondition: ICondition) {

    }

    static async create(id_add: number, data: any, append: boolean = false) {
        const item = await Additions.findOne({ id: id_add })
        if (!append)
            await AdditionsIngredients.delete({ id_addition: item.id })
        for (const ingr of data) {
            const new_ingr = new AdditionsIngredients()
            new_ingr.id_addition = item.id
            new_ingr.count = ingr.count
            new_ingr.eatable = ingr.eatable
            new_ingr.id_good = ingr.id_good
            await new_ingr.save()
        }
        return data
    }

    static async update(id_add: number, id_ingr: number, data: any) {
        const item = await AdditionsIngredients.findOne({ id: id_ingr, id_addition: id_add })
        if (!item)
            throw new BadRequestError('Ingredients not found')

        item.id_good = data.id_good ?? item.id_good
        item.count = data.count ?? item.count
        item.eatable = data.eatable ?? item.eatable
        return await item.save()
    }

    static async delete(id_add: number, id_ingr: number) {
        const result = await AdditionsIngredients.delete({ id: id_ingr, id_addition: id_add })
        if (result.affected == 0)
            throw new NotFoundError('AdditionsIngredient not found')

        return result
    }
}