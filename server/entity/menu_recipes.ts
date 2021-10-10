import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Goods } from "./goods";

@Entity()
export class MenuRecipes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(() => Goods)
    @JoinTable()
    goods: Goods[]

    @Column({ length: 1000 })
    description: string
}