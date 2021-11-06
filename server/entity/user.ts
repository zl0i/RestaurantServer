import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import Orders from "./orders";
import { user_permissions } from "./user_permissions";

@Entity()
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    name: string;

    @Column({ default: '' })
    lastname: string;

    @Column({ default: null })
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

    @OneToMany(() => user_permissions, permissions => permissions.user)
    permissions: user_permissions[]

    removePrivateData() {
        delete this.password
        delete this.sms_code
        delete this.sms_code_expired_at
        return this
    }
}
