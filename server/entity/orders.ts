import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, SaveOptions, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, OneToMany, RelationId, JoinColumn, AfterLoad } from "typeorm";
import Menu from "./menu";
import OrderContent from "./order_content";
import { Users } from "./user";

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

    //These checks are necessary because TypeOrm creates all enitities on startup without save 
    constructor(menu: Array<Menu>, user: Users) {
        super()
        this.id_user = user?.id
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

    @ManyToOne(() => Users, user => user.id)
    @JoinColumn({ name: 'id_user' })
    user: Users

    @Column({ default: OrderStatus.accepted })
    status: OrderStatus

    @Column({ default: null })
    payment_id: string

    @Column({ default: null })
    comment: string

    @OneToMany(() => OrderContent, content => content.order)
    content: OrderContent[]

    async save(options?: SaveOptions): Promise<this> {
        const s = await super.save(options)
        for (const c of this._content) {
            await c.save({ data: s })
        }
        return s
    }

    async remove(): Promise<this> {
        OrderContent.delete({ id_order: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const orders = await Orders.find(criteria)
        for (const o of orders) {
            OrderContent.delete({ id_order: o.id })
        }
        return super.delete(criteria, options)
    }

    @AfterLoad()
    deletePrivateField() {
        delete this._content
    }
}
