import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";

@Entity()
export default class OrderContent extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_order: number

    @Column()
    id_menu: number

    @Column()
    cost: number

    @Column()
    count: number
}
