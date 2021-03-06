import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinTable, ManyToMany, OneToMany, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
import { Goods } from "./goods.entity";
import Points from "./points.entity";
import { UsersInfo } from "./users_info.entity";
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

    @ManyToMany(() => UsersInfo, user => user.warehouses)
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
    users: UsersInfo[]

    @OneToMany(() => WarehousesGoods, wg => wg.good)
    goods: Goods[]

    async remove(): Promise<this> {
        await WarehousesGoods.delete({ id_warehouse: this.id })
        return await super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const warehouses = await Warehouses.find(criteria)
        for (const wh of warehouses) {
            await WarehousesGoods.delete({ id_warehouse: wh.id })
        }
        return await super.delete(criteria, options)
    }
}
