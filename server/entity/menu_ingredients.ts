import { BaseEntity, Entity, JoinColumn, PrimaryGeneratedColumn, Column, ManyToOne, RelationId } from "typeorm";
import { Goods } from "./goods";
import Menu from "./menu";

@Entity()
export class MenuIngredients extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((mr: MenuIngredients) => mr.good)
    @Column()
    id_good: number

    @Column()
    count: number

    @RelationId((ingredients: MenuIngredients) => ingredients.menu)
    @Column()
    id_menu: number

    @Column()
    eatable: boolean

    @ManyToOne(() => Goods, good => good.id)
    @JoinColumn({ name: "id_good" })
    good: Goods;

    @ManyToOne(() => Menu, menu => menu.id)
    @JoinColumn({ name: "id_menu" })
    menu: Menu
}