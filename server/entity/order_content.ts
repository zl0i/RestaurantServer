import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import Menu from "./menu";
import Orders from "./orders";
import OrdersAdditionsContent from "./orders_additions_content.entity";

@Entity()
export default class OrderContent extends BaseEntity {

    constructor(menu: Menu) {
        super()
        this.id_menu = menu?.id
        this.count = menu?.qty
        this.cost = menu?.qty * menu?.cost
        for (const ad of menu?.additions_category || []) {
            const content = new OrdersAdditionsContent(ad)
            this.cost += content.cost
            this.additions.push(content)
        }
    }

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Menu, menu => menu.id)
    @JoinColumn()
    id_menu: number

    @Column()
    cost: number

    @Column()
    count: number

    @ManyToOne(() => Orders, order => order.id)
    order: Orders | number

    @OneToMany(() => OrdersAdditionsContent, content => content.order_content)
    additions: OrdersAdditionsContent[]

    async save(options?: SaveOptions): Promise<this> {
        this.order = options.data['id']
        const s = await super.save()
        for (const a of this.additions) {
            await a.save({ data: s })
        }
        return s
    }

    async remove(): Promise<this> {
        OrdersAdditionsContent.delete({ order_content: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const content = await OrderContent.find(criteria)
        for (const c of content) {
            OrdersAdditionsContent.delete({ order_content: c.id })
        }
        return super.delete(criteria, options)
    }
}
