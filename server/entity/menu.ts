import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

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

    @Column({ default: MenuStatus.active })
    status: MenuStatus

    @Column({ default: '' })
    description: string
}



