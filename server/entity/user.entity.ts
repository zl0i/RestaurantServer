import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ObjectType, DeleteResult, FindConditions, RemoveOptions, SaveOptions, OneToOne } from "typeorm";
import Orders from "./orders.entity";
import { Tokens } from "./tokens.entity";
import { TokenPermissions } from "./token_permissions.entity";
import { UsersInfo } from "./users_info.entity";
import { UserPermissions } from "./user_permissions.entity";



@Entity()
export class Users extends BaseEntity {

    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    password: string;

    @Column({ default: "" })
    sms_code: string;

    @Column({ default: null })
    sms_code_expired_at: Date;

    @OneToOne(() => UsersInfo)
    info: UsersInfo

    async save(options?: SaveOptions): Promise<this> {
        const user = await super.save(options)
        if (this.info) {
            this.info.id = user.id
            await this.info.save()
        }
        return user
    }

    async remove(): Promise<this> {
        await UserPermissions.delete({ id_user: this.id })
        await Orders.delete({ id_user: this.id })
        await UsersInfo.delete({ id: this.id })
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
            await UsersInfo.delete({ id: user.id })
            await UserPermissions.delete({ id_user: user.id })
            await Orders.delete({ id_user: user.id })
            const token = await Tokens.findOne({ id_user: user.id })
            if (token) {
                await TokenPermissions.delete({ id_token: token.id })
                await token.remove()
            }
        }
        return await super.delete(criteria, options)
    }
}
