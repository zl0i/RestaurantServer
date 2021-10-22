import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToOne, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
import AdditionsCategory from "./additions_category";
import { AdditionsRecipes } from "./additions_recipes";


@Entity()
export default class Additions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AdditionsCategory, category => category.id)
    id_category: AdditionsCategory

    @Column()
    name: string

    @Column()
    cost: number

    @OneToOne(() => AdditionsRecipes, recipe => recipe.id)
    @JoinColumn()
    recipe: AdditionsRecipes

    async remove(): Promise<this> {
        AdditionsRecipes.delete({ id: this.recipe.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const additions = await Additions.find(criteria)
        for (const a of additions) {
            AdditionsRecipes.delete({ id: a.recipe.id })
        }
        return super.delete(criteria, options)
    }
}



