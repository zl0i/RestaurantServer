import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, SaveOptions } from "typeorm";
import AdditionsCategory from "./additions_category";


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

    @Column()
    id_order_content: number

    @Column()
    id_additions: number

    @Column()
    cost: number

    @Column()
    count: number

    async save(options?: SaveOptions): Promise<this> {
        this.id_order_content = options.data['id']
        return await super.save()
    }
}
