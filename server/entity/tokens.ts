import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";
import { Users } from "./user";

@Entity()
export class Tokens extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    token: string

    @Column({default: null})
    expired_at: Date

    @OneToOne(() => Users)
    @Column()
    id_user: number
}
