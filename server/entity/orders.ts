import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

export enum OrderStatus {
    accepted = 'accepted',
    wait_payment = 'wait_payment',
    paymented = 'paymented',
    cancel_payment = 'cancel_payment',
    cooking = 'cooking',
    delivering = 'delivered',
    completed = 'completed'
}

@Entity()
export default class Orders extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    total: number

    @Column({ default: null })
    date: Date

    @Column()
    id_point: number

    @Column()
    id_user: number

    @Column({ default: OrderStatus.accepted })
    status: OrderStatus

    @Column({ default: '' })
    payment_id: string

    @Column({ default: '' })
    comment: string

    @Column({ default: '', length: 12 })
    phone: string
}
