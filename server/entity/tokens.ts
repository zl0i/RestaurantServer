import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, CreateDateColumn, DeleteResult, ObjectType, FindConditions, RemoveOptions, In } from "typeorm";
import jwt from 'jsonwebtoken'
import { Users } from "./user";
import { token_permissions } from "./token_permissions";

const secret_key = process.env['APP_SECRET'] || 'shhhh'

@Entity()
export class Tokens extends BaseEntity {

    constructor(user_id: number, permissions: string) {
        super();
        this.id_user = user_id
        const d = new Date()
        d.setDate(d.getDate() + 10)
        this.token = jwt.sign({ id: user_id, rights: permissions }, secret_key, { expiresIn: '10d' })
        this.expired_at = d
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 500 })
    token: string

    @Column()
    expired_at: Date

    @OneToOne(() => Users)
    @Column()
    id_user: number

    @CreateDateColumn()
    create_date: Date

    async remove(): Promise<this> {
        await token_permissions.delete({ id_token: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const token = await Tokens.find(criteria)
        token_permissions.delete({ id_token: In(token.map((t) => t.id)) })
        return super.delete(criteria, options)
    }
}
