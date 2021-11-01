import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany } from "typeorm";
import AdditionsCategory from "./additions_category";
import { AdditionsIngredients } from "./additions_ingredients";


@Entity()
export default class Additions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AdditionsCategory, category => category.id)
    id_category: AdditionsCategory | number

    @Column()
    name: string

    @Column()
    cost: number

    @OneToMany(() => AdditionsIngredients, recipe => recipe.addition)
    recipe: AdditionsIngredients[]

    async remove(): Promise<this> {
        AdditionsIngredients.delete({ id_addition: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const additions = await Additions.find(criteria)
        for (const a of additions) {
            AdditionsIngredients.delete({ id_addition: a.id })
        }
        return super.delete(criteria, options)
    }
}



