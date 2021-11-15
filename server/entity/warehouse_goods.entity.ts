import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, RelationId, ManyToOne, JoinColumn } from "typeorm";
import { Goods } from "./goods";
import Warehouses from "./warehouses.entity";


@Entity()
export default class WarehousesGoods extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @RelationId((wg: WarehousesGoods) => wg.good)
    @Column()
    id_good: number

    @RelationId((wg: WarehousesGoods) => wg.warehouse)
    @Column()
    id_warehouse: number

    @Column()
    count: number

    @Column()
    unit: string

    @ManyToOne(_ => Warehouses, wg => wg.id)
    @JoinColumn({ name: 'id_warehouse' })
    warehouse: Warehouses

    @ManyToOne(_ => Goods, good => good.id)
    @JoinColumn({ name: 'id_good' })
    good: Goods
}
