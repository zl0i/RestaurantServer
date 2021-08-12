import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export default class OrderDelivery extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_order: number

    @Column()
    address: string

    @Column()
    cost: number
}
