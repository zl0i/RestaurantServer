import { Entity, PrimaryColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";


export enum OrderPaymentStatus {
    wait = 'wait',
    paid = 'paid',
    cancel = 'cancel',
}

@Entity()
export default class OrdersPayment extends BaseEntity {

    constructor(id_order: number, payment_id: string, key: string) {
        super()
        this.id_order = id_order
        this.payment_id = payment_id
        this.idempotence_key = key
    }

    @PrimaryColumn()
    id_order: number;

    @Column()
    payment_id: string

    @Column({ default: OrderPaymentStatus.wait })
    status: OrderPaymentStatus

    @Column()
    idempotence_key: string


    @CreateDateColumn()
    created_at: Date

}
