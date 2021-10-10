import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Goods } from "./goods";

@Entity()
export class AdditionsRecipes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(() => Goods, goods => goods.id)
    @JoinTable()
    goods: Goods[]

    @Column({ length: 1000 })
    description: string
}