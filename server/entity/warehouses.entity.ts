import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinTable, ManyToMany, OneToMany, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
import { DomainError } from "../lib/errors";
import { Goods } from "./goods.entity";
import Points from "./points.entity";
import { Users } from "./user.entity";
import WarehousesGoods from "./warehouse_goods.entity";

@Entity()
export default class Warehouses extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    address: string

    @Column({ default: null })
    lat: number

    @Column({ default: null })
    lon: string

    @ManyToMany(() => Points, point => point.id)
    @JoinTable({
        name: "warehouses_points",
        joinColumn: {
            name: "id_warehouse",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "id_point",
            referencedColumnName: "id"
        }
    })
    points: Points[]

    @ManyToMany(() => Users, user => user.warehouses)
    @JoinTable({
        name: "users_warehouses",
        joinColumn: {
            name: "id_warehouse",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "id_user",
            referencedColumnName: "id"
        }
    })
    users: Users[]

    @OneToMany(() => WarehousesGoods, wg => wg.good)
    goods: Goods[]

    async remove(): Promise<this> {
        const goods = await WarehousesGoods.find({ id_warehouse: this.id })
        if (goods.length > 0)
            throw new DomainError("You cannot delete a non-empty warehouse")
        return await super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const warehouses = await Warehouses.find(criteria)
        for (const wh of warehouses) {
            const goods = await WarehousesGoods.find({ id_warehouse: wh.id })
            //TODO: domain logic
            if (goods.length > 0)
                throw new DomainError("You cannot delete a non-empty warehouse")
        }
        return await super.delete(criteria, options)
    }
}
