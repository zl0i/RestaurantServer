import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import AdditionsItem from "./additions";
import Menu from "./menu";


export enum AdditionsMode {
    single = 'single',
    many = 'many'
}

@Entity()
export default class AdditionsCategory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => Menu, menu => menu.id)
    id_menu: Menu

    @Column()
    mode: AdditionsMode

    @OneToMany(() => AdditionsItem, item => item.id_additions)
    additions_item: AdditionsItem[]
}



