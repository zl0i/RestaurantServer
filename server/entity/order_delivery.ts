import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";
import Points from "./points";


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
