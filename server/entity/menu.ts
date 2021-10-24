import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, OneToOne, JoinColumn, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, AfterLoad } from "typeorm";
import ObjectStorage from "../src/storage";
import AdditionsCategory from "./additions_category";
import MenuCategory from "./menu_category";
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

    @OneToOne(() => MenuRecipes, recipe => recipe.id)
    @JoinColumn()
    recipe: MenuRecipes

    async remove(): Promise<this> {
        AdditionsCategory.delete({ id_menu: this }) //TO DO if ManyToMany then don't remove
        MenuRecipes.delete({ id: this.recipe.id })
        if (this.icon)
            await ObjectStorage.deleteImage(this.icon)
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const menu = await Menu.find(criteria)
        for (const m of menu) {
            AdditionsCategory.delete({ id_menu: m }) //TO DO if ManyToMany then don't remove
            MenuRecipes.delete({ id: m.recipe.id })
            if (m.icon)
                await ObjectStorage.deleteImage(m.icon)
        }
        return super.delete(criteria, options)
    }
}



