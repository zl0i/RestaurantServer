import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
import Menu from "./menu";
import OrdersAdditionsContent from "./orders_additions_content.entity";

@Entity()
export default class OrderContent extends BaseEntity {

    private additions: OrdersAdditionsContent[] = new Array()

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

    @Column()
    id_order: number

    @Column()
    id_menu: number

    @Column()
    cost: number

    @Column()
    count: number

    async save(options?: SaveOptions): Promise<this> {
        this.id_order = options.data['id']
        const s = await super.save()
        for (const a of this.additions) {
            await a.save({ data: s })
        }
        return s
    }

    async remove(): Promise<this> {
        OrdersAdditionsContent.delete({ id_order_content: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const content = await OrderContent.find(criteria)
        for (const c of content) {
            OrdersAdditionsContent.delete({ id_order_content: c.id })
        }
        return super.delete(criteria, options)
    }
}
