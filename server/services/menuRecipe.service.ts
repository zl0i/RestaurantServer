import { MenuRecipes } from "../entity/menu_recipes.entity";
import HttpError from "../lib/httpError";
import { ICondition } from "../middleware/scopes/basicScope";


export default class MenuRecipeService {

    static async read(icondition: ICondition) {

    }

    static async create(id_menu: number, data: any) {
        const item = await MenuRecipes.findOne({ id_menu: id_menu })
        if (item) {
            item.recipe = data.recipe ?? item.recipe
            return await item.save()
        } else {
            const newRecipe = new MenuRecipes()
            newRecipe.recipe = String(data.recipe)
            newRecipe.id_menu = id_menu
            return await newRecipe.save()
        }
    }

    static async update(id: number, data: any) {

    }

    static async delete(id: number) {
        const result = await MenuRecipes.delete({ id })
        if (result.affected == 0)
            throw new HttpError(400, 'MenuRecipe not found')

        return result
    }
}