import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, DeleteResult, ObjectType, FindConditions, RemoveOptions, In, ManyToOne, RelationId, JoinColumn, OneToMany } from "typeorm";
import jwt from 'jsonwebtoken'
import { Users } from "./user.entity";
import { TokenPermissions } from "./token_permissions.entity";

const secret_key = process.env['APP_SECRET'] || 'shhhh'

@Entity()
export class Tokens extends BaseEntity {

    constructor(user_id: number) {
        super();
        this.id_user = user_id
        const d = new Date()
        d.setDate(d.getDate() + 10)
        this.token = jwt.sign({ id: user_id }, secret_key, { expiresIn: '10d' })
        this.expired_at = d
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    token: string

    @Column()
    expired_at: Date

    @RelationId((token: Tokens) => token.user)
    @Column()
    id_user: number

    @CreateDateColumn()
    create_date: Date

    @ManyToOne(() => Users, user => user.tokens)
    @JoinColumn({ name: 'id_user' })
    user: Users

    @OneToMany(() => TokenPermissions, permissions => permissions.token)
    permissions: TokenPermissions[]

    async remove(): Promise<this> {
        await TokenPermissions.delete({ id_token: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const token = await Tokens.find(criteria)
        TokenPermissions.delete({ id_token: In(token.map((t) => t.id)) })
        return super.delete(criteria, options)
    }
}
