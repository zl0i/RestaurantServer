import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, JoinColumn, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, AfterLoad, OneToOne, RelationId, ManyToMany, JoinTable } from "typeorm";
import AdditionsCategory from "./additions_category.entity";
import MenuCategory from "./menu_category.entity";
import { MenuIngredients } from "./menu_ingredients.entity";
import { MenuRecipes } from "./menu_recipes.entity";

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

    @RelationId((menu: Menu) => menu.category)
    @Column()
    id_category: number

    @ManyToOne(() => MenuCategory, category => category.id)
    @JoinColumn({ name: 'id_category' })
    category: MenuCategory

    @Column({ default: MenuStatus.active })
    status: MenuStatus

    @Column({ default: '', length: 1000 })
    description: string

    @ManyToMany(() => AdditionsCategory)
    @JoinTable({
        name: 'menu_additions_category',
        inverseJoinColumn: {
            name: "id_additions_category",
            referencedColumnName: "id"
        },
        joinColumn: {
            name: "id_menu",
            referencedColumnName: 'id'
        }
    })
    additions_category: AdditionsCategory[]

    @OneToMany(() => MenuIngredients, ingredients => ingredients.menu)
    ingredients: MenuIngredients[]

    @OneToOne(() => MenuRecipes, recipe => recipe.menu)
    recipe: MenuRecipes

    async remove(): Promise<this> {
        MenuIngredients.delete({ id_menu: this.id })
        MenuRecipes.delete({ id_menu: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const menu = await Menu.find(criteria)
        for (const m of menu) {
            MenuIngredients.delete({ id_menu: m.id })
            MenuRecipes.delete({ id_menu: m.id })
        }
        return super.delete(criteria, options)
    }

    @AfterLoad()
    deleteQty() {
        delete this.qty
    }
}



