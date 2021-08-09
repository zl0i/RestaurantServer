import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";
import { Points } from "./points";
import { Users } from "./user";

@Entity()
export default class Orders extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cost: number

    @Column({ default: null })
    date: Date

    @OneToOne(() => Points)
    @Column()
    id_point: number


    @OneToOne(() => Users)
    @Column()
    id_user: number


    @Column('text')
    status: OrderStatus

    @Column({default: null})
    payment_id: string
}


export enum OrderStatus {
    wait_payment = 'wait_payment',
    paymented = 'paymented',
    cancel_payment = 'cancel_payment',
    cooking = 'cooking',
    delivering = 'delivered',
    completed = 'completed'
}
