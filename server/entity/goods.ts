import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { AdditionsRecipes } from "./additions_recipes"
import { MenuRecipes } from "./menu_recipes"

@Entity()
export class Goods extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    cost: number

    @Column()
    count: number

    @Column()
    weight: number

    @ManyToMany(() => MenuRecipes, recipe => recipe.id)
    @ManyToMany(() => AdditionsRecipes, recipe => recipe.id)
    recipes: MenuRecipes[] | AdditionsRecipes[] | number
}