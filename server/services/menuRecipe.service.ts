import { MenuRecipes } from "../entity/menu_recipes";
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
        await MenuRecipes.delete({ id_menu: id })
    }
}