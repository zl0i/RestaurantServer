import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import Additions from "./additions";
import AdditionsCategory from "./additions_category";
import OrderContent from "./order_content";


@Entity()
export default class OrdersAdditionsContent extends BaseEntity {

    constructor(category: AdditionsCategory) {
        super()
        for (const ad of category?.additions || []) {
            this.id_additions = ad.id
            this.count = ad['count']
            this.cost = ad.cost * ad['count']
        }
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderContent, content => content.additions)
    order_content: OrderContent | number

    @OneToOne(() => Additions, additions => additions.id)
    @JoinColumn()
    id_additions: Additions | number

    @Column()
    cost: number

    @Column()
    count: number

    async save(options?: SaveOptions): Promise<this> {
        this.order_content = options.data['id']
        return await super.save()
    }
}
