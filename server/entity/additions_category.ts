import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import Additions from "./additions";
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

    @ManyToOne(() => Menu, menu => menu.id) //ManyToMany
    id_menu: Menu

    @Column()
    mode: AdditionsMode

    @OneToMany(() => Additions, additions => additions.id_category)
    additions: Additions[]
}



