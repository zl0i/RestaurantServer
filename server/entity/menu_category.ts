import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";


@Entity()
export default class MenuCategory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: null })
    icon: string

    @Column()
    id_point: number

    @Column({ default: '' })
    description: string
}



