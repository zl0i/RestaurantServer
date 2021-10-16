import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import AdditionsCategory from "./additions_category";
import { AdditionsRecipes } from "./additions_recipes";


@Entity()
export default class Additions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AdditionsCategory, addition => addition.id)
    id_additions: AdditionsCategory

    @Column()
    name: string

    @Column()
    cost: number

    @OneToOne(() => AdditionsRecipes, recipe => recipe.id)
    @JoinColumn()
    recipe: AdditionsRecipes
}



