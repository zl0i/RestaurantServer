import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import Additions from "./additions";
import { AdditionsRecipes } from "./additions_recipes";


@Entity()
export default class AdditionsItem extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Additions, addition => addition.id)
    id_additions: Additions

    @Column()
    name: string

    @Column()
    cost: number

    @OneToOne(() => AdditionsRecipes, recipe => recipe.id)
    @JoinColumn()
    recipe: AdditionsRecipes
}



