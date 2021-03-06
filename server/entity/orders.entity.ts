import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, SaveOptions, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, OneToMany, RelationId, JoinColumn, AfterLoad } from "typeorm";
import Menu from "./menu.entity";
import OrdersPayment from "./orders_payment.entity";
import OrderContent from "./order_content.entity";
import { UsersInfo } from "./users_info.entity";

export enum OrderStatus {
    accepted = 'accepted',
    wait_payment = 'wait_payment',
    paymented = 'paymented',
    cancel = 'cancel',
    cooking = 'cooking',
    delivering = 'delivered',
    completed = 'completed'
}

@Entity()
export default class Orders extends BaseEntity {

    //These checks are necessary because TypeOrm creates all enitities on startup without save 
    constructor(menu: Array<Menu>, id_user: number) {
        super()
        this.id_user = id_user
        this.total = 0
        for (const m of menu || []) {
            const content = new OrderContent(m)
            this._content.push(content)
            this.total += content.cost
        }
    }

    private _content: OrderContent[] = new Array()

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    total: number

    @CreateDateColumn()
    create_date: Date

    @RelationId((order: Orders) => order.user)
    @Column()
    id_user: number

    @ManyToOne(() => UsersInfo, user => user.id)
    @JoinColumn({ name: 'id_user' })
    user: UsersInfo

    @Column({ default: OrderStatus.accepted })
    status: OrderStatus

    @Column({ default: null })
    comment: string

    @OneToMany(() => OrderContent, content => content.order)
    content: OrderContent[]

    @OneToMany(() => OrdersPayment, payment => payment.order)
    payments: OrdersPayment[]

    async save(options?: SaveOptions): Promise<this> {
        const s = await super.save(options)
        if (this._content) {
            for (const c of this._content) {
                await c.save({ data: s })
            }
        }
        return s
    }

    async remove(): Promise<this> {
        await OrdersPayment.delete({ id_order: this.id })
        await OrderContent.delete({ id_order: this.id })
        return await super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const orders = await Orders.find(criteria)
        for (const o of orders) {
            await OrdersPayment.delete({ id_order: o.id })
            await OrderContent.delete({ id_order: o.id })
        }
        return await super.delete(criteria, options)
    }

    @AfterLoad()
    deletePrivateField() {
        delete this._content
    }
}
