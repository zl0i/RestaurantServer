import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import Additions from "./additions";
import { Goods } from "./goods";

@Entity()
export class AdditionsIngredients extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((adr: AdditionsIngredients) => adr.good)
    id_good: number

    @Column()
    count: number

    @RelationId((ingredients: AdditionsIngredients) => ingredients.addition)
    id_addition: number

    @Column()
    eatable: boolean

    @ManyToOne(() => Goods, good => good.id)
    @JoinColumn({ name: "id_good" })
    good: Goods;

    @ManyToOne(() => Additions, add => add.id)
    @JoinColumn({ name: "id_addition" })
    addition: Additions
}