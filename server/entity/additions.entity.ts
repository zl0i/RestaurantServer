import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany, OneToOne, RelationId, JoinColumn, AfterLoad } from "typeorm";
import AdditionsCategory from "./additions_category.entity";
import { AdditionsIngredients } from "./additions_ingredients.entity";
import { AdditionsRecipes } from "./addition_recipes.entity";


@Entity()
export default class Additions extends BaseEntity {

    public qty: number = 0

    @PrimaryGeneratedColumn()
    id: number;

    @RelationId((additions: Additions) => additions.category)
    @Column()
    id_category: number

    @ManyToOne(() => AdditionsCategory, category => category.id)
    @JoinColumn({ name: 'id_category' })
    category: AdditionsCategory

    @Column()
    name: string

    @Column()
    cost: number

    @OneToMany(() => AdditionsIngredients, ingredients => ingredients.addition)
    ingredients: AdditionsIngredients[]

    @OneToOne(() => AdditionsRecipes, recipe => recipe.addition)
    recipe: AdditionsRecipes

    async remove(): Promise<this> {
        AdditionsIngredients.delete({ id_addition: this.id })
        AdditionsRecipes.delete({ id_addition: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const additions = await Additions.find(criteria)
        for (const a of additions) {
            await AdditionsIngredients.delete({ id_addition: a.id })
            await AdditionsRecipes.delete({ id_addition: a.id })
        }
        return super.delete(criteria, options)
    }

    @AfterLoad()
    deleteQty() {
        delete this.qty
    }
}



