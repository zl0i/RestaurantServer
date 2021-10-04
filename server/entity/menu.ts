import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import Additions from "./additions";

export enum MenuStatus {
    active = 'active',
    inactive = 'unactive'
}

@Entity()
export default class Menu extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: null })
    icon: string

    @Column()
    cost: number

    @Column()
    id_point: number

    @Column()
    id_category: number

    @Column({ default: MenuStatus.active })
    status: MenuStatus

    @Column({ default: '', length: 1000 })
    description: string

    @OneToMany(() => Additions, additions => additions.id_menu)
    additions: Additions[]
}



