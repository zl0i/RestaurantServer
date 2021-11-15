import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToOne, JoinColumn, OneToMany, RelationId, AfterLoad } from "typeorm";
import Menu from "./menu.entity";
import Orders from "./orders.entity";
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
            this._additions.push(content)
        }
    }

    private _additions: OrdersAdditionsContent[] = new Array()

    @PrimaryGeneratedColumn()
    id: number;

    @RelationId((content: OrderContent) => content.menu)
    @Column()
    id_menu: number

    @ManyToOne(() => Menu, menu => menu.id)
    @JoinColumn({ name: 'id_menu' })
    menu: Menu

    @Column()
    cost: number

    @Column()
    count: number

    @RelationId((content: OrderContent) => content.order)
    @Column()
    id_order: number

    @ManyToOne(() => Orders, order => order.id)
    @JoinColumn({ name: 'id_order' })
    order: Orders 

    @OneToMany(() => OrdersAdditionsContent, content => content.order_content)
    additions: OrdersAdditionsContent[]

    async save(options?: SaveOptions): Promise<this> {
        this.id_order = options.data['id']
        const s = await super.save(options)
        for (const a of this._additions) {
            await a.save({ data: s })
        }
        return s
    }

    async remove(): Promise<this> {
        await OrdersAdditionsContent.delete({ id_order_content: this.id })
        return await super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const content = await OrderContent.find(criteria)
        for (const c of content) {
            await OrdersAdditionsContent.delete({ id_order_content: c.id })
        }
        return await super.delete(criteria, options)
    }

    @AfterLoad()
    deletePrivateField() {
        delete this._additions
    }
}
