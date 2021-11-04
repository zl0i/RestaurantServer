import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, JoinColumn, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, AfterLoad, OneToOne } from "typeorm";
import ObjectStorage from "../src/storage";
import AdditionsCategory from "./additions_category";
import MenuCategory from "./menu_category";
import { MenuIngredients } from "./menu_ingredients";
import { MenuRecipes } from "./menu_recipes";

export enum MenuStatus {
    active = 'active',
    inactive = 'unactive'
}

@Entity()
export default class Menu extends BaseEntity {

    public qty: number = 0

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: null })
    icon: string

    @Column()
    cost: number

    @ManyToOne(() => MenuCategory, mc => mc.id)
    @JoinColumn()
    category: MenuCategory | number

    @Column({ default: MenuStatus.active })
    status: MenuStatus

    @Column({ default: '', length: 1000 })
    description: string

    @OneToMany(() => AdditionsCategory, additions => additions.id_menu)
    additions_category: AdditionsCategory[]

    @OneToMany(() => MenuIngredients, ingredients => ingredients.menu)
    ingredients: MenuIngredients[]

    @OneToOne(() => MenuRecipes, recipe => recipe.menu)
    recipe: MenuRecipes

    async remove(): Promise<this> {
        AdditionsCategory.delete({ id_menu: this }) //TO DO if ManyToMany then don't remove
        MenuIngredients.delete({ id_menu: this.id })
        MenuRecipes.delete({ id_menu: this.id })
        if (this.icon)
            await ObjectStorage.deleteImage(this.icon)
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const menu = await Menu.find(criteria)
        for (const m of menu) {
            AdditionsCategory.delete({ id_menu: m }) //TO DO if ManyToMany then don't remove
            MenuIngredients.delete({ id_menu: m.id })
            MenuRecipes.delete({ id_menu: m.id })
            if (m.icon)
                await ObjectStorage.deleteImage(m.icon)
        }
        return super.delete(criteria, options)
    }

    @AfterLoad()
    deleteQty() {
        delete this.qty
    }
}



