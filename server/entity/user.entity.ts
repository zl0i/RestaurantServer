import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ObjectType, DeleteResult, FindConditions, RemoveOptions, ManyToMany } from "typeorm";
import Orders from "./orders.entity";
import Points from "./points.entity";
import { Tokens } from "./tokens.entity";
import { TokenPermissions } from "./token_permissions.entity";
import { UserPermissions } from "./user_permissions.entity";
import Warehouses from "./warehouses.entity";

@Entity()
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    name: string;

    @Column({ default: '' })
    lastname: string;

    @Column({ unique: true })
    login: string;

    @Column({ default: null })
    password: string;

    @Column({ default: 0 })
    age: number;

    @Column({ default: null })
    birthday: Date;

    @Column({ default: "" })
    phone: string;

    @Column({ default: false })
    verify_phone: Boolean;

    @Column({ default: "" })
    sms_code: String;

    @Column({ default: null })
    sms_code_expired_at: Date;

    @OneToMany(() => Orders, order => order.id)
    orders: Orders[]

    @OneToMany(() => UserPermissions, permissions => permissions.user)
    permissions: UserPermissions[]

    @ManyToMany(() => Warehouses, warehouses => warehouses.users)
    warehouses: Warehouses[]

    @ManyToMany(() => Points, point => point.users)
    points: Points[]

    @OneToMany(() => Tokens, token => token.user)
    tokens: Tokens[]

    removePrivateData() {
        delete this.password
        delete this.sms_code
        delete this.sms_code_expired_at
        return this
    }

    async remove(): Promise<this> {
        await UserPermissions.delete({ id_user: this.id })
        await Orders.delete({ id_user: this.id })
        const token = await Tokens.findOne({ id_user: this.id })
        if (token) {
            await TokenPermissions.delete({ id_token: token.id })
            await token.remove()
        }
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const users = await Users.find(criteria)
        for (const user of users) {
            await UserPermissions.delete({ id_user: user.id })
            await Orders.delete({ id_user: user.id })
            const token = await Tokens.findOne({ id_user: user.id })
            if (token) {
                await TokenPermissions.delete({ id_token: token.id })
                await token.remove()
            }
        }
        return super.delete(criteria, options)
    }
}
