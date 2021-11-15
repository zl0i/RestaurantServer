import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { AdditionsIngredients } from "./additions_ingredients"
import { MenuIngredients } from "./menu_ingredients"


@Entity()
export class Goods extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    cost: number

    @OneToMany(() => MenuIngredients, ingredients => ingredients.good)
    menu_ingredients: MenuIngredients[]

    @OneToMany(() => AdditionsIngredients, ingredients => ingredients.good)
    additions_ingredients: AdditionsIngredients[]
}