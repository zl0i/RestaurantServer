import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, CreateDateColumn } from "typeorm";
import jwt from 'jsonwebtoken'
import { Users } from "./user";

const secret_key = process.env['APP_SECRET'] || 'shhhh'

@Entity()
export class Tokens extends BaseEntity {

    constructor(user_id: number) {
        super();
        this.id_user = user_id
        this.token = jwt.sign({ user_id: user_id, role: 'role' }, secret_key)
        const d = new Date()
        d.setDate(d.getDate() + 10)
        this.expired_at = d
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    token: string

    @Column()
    expired_at: Date

    @OneToOne(() => Users)
    @Column()
    id_user: number

    @CreateDateColumn()
    create_date: Date
}
