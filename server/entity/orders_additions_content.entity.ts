import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions, ManyToOne, JoinColumn, RelationId } from "typeorm";
import Additions from "./additions.entity";
import AdditionsCategory from "./additions_category.entity";
import OrderContent from "./order_content.entity";


@Entity()
export default class OrdersAdditionsContent extends BaseEntity {

    constructor(category: AdditionsCategory) {
        super()
        for (const ad of category?.additions || []) {
            this.id_addition = ad.id
            this.count = ad.qty
            this.cost = ad.cost * ad.qty
        }
    }

    @PrimaryGeneratedColumn()
    id: number;

    @RelationId((content: OrdersAdditionsContent) => content.order_content)
    @Column()
    id_order_content: number

    @ManyToOne(() => OrderContent, content => content.additions)
    @JoinColumn({ name: 'id_order_content' })
    order_content: OrderContent 

    @RelationId((content: OrdersAdditionsContent) => content.addition)
    @Column()
    id_addition: number

    @ManyToOne(() => Additions, additions => additions.id)
    @JoinColumn({ name: 'id_addition' })
    addition: Additions

    @Column()
    cost: number

    @Column()
    count: number

    async save(options?: SaveOptions): Promise<this> {
        this.id_order_content = options.data['id']
        return await super.save()
    }
}
