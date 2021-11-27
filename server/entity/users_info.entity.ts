import { Entity, Column, BaseEntity, OneToMany, ManyToMany, PrimaryColumn } from "typeorm";
import Orders from "./orders.entity";
import Points from "./points.entity";
import { UserPermissions } from "./user_permissions.entity";
import Warehouses from "./warehouses.entity";

@Entity()
export class UsersInfo extends BaseEntity {

    @PrimaryColumn()
    id: number;

    @Column({ default: '' })
    name: string;

    @Column({ default: '' })
    lastname: string;

    @Column({ unique: true })
    login: string;

    @Column({ default: 0 })
    age: number;

    @Column({ default: null })
    birthday: Date;

    @Column({ default: "" })
    phone: string;

    @Column({ default: false })
    verify_phone: Boolean;

    @OneToMany(() => Orders, order => order.id)
    orders: Orders[]

    @OneToMany(() => UserPermissions, permissions => permissions.user)
    permissions: UserPermissions[]

    @ManyToMany(() => Warehouses, warehouses => warehouses.users)
    warehouses: Warehouses[]

    @ManyToMany(() => Points, point => point.users)
    points: Points[]
}
