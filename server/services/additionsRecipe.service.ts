import { AdditionsRecipes } from "../entity/addition_recipes.entity";
import { NotFoundError } from "../lib/errors";
import { ICondition } from "../middleware/scopes/basicScope";


export default class AdditionsRecipeService {

    static async read(icondition: ICondition) {

    }

    static async create(id_addition: number, data: any) {
        const item = await AdditionsRecipes.findOne({ id_addition: id_addition })
        if (item) {
            item.recipe = data.recipe ?? item.recipe
            return await item.save()
        } else {
            const newRecipe = new AdditionsRecipes()
            newRecipe.recipe = String(data.recipe)
            newRecipe.id_addition = id_addition
            console.log(newRecipe)
            return await newRecipe.save()
        }
    }

    static async update(id: number, data: any) {

    }

    static async delete(id: number) {
        const result = await AdditionsRecipes.delete({ id_addition: id })
        if (result.affected == 0)
            throw new NotFoundError('AdditionsRecipe not found')

        return result
    }
}