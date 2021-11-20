import { Entity, PrimaryColumn, Column, BaseEntity, CreateDateColumn, ManyToOne, JoinColumn, RelationId } from "typeorm";
import Orders from "./orders.entity";


export enum OrderPaymentStatus {
    wait = 'wait',
    paid = 'paid',
    cancel = 'cancel',
}

@Entity()
export default class OrdersPayment extends BaseEntity {

    constructor(id_order: number, token: string, payment_id: string, key: string) {
        super()
        this.id_order = id_order
        this.payment_id = payment_id
        this.token = token
        this.idempotence_key = key
    }

    @RelationId((payment: OrdersPayment) => payment.order)
    @PrimaryColumn()
    id_order: number;

    @Column()
    payment_id: string

    @Column({ default: OrderPaymentStatus.wait })
    status: OrderPaymentStatus

    @Column()
    token: string

    @Column()
    idempotence_key: string

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Orders, order => order.id)
    @JoinColumn({ name: 'id_order' })
    order: Orders
}
