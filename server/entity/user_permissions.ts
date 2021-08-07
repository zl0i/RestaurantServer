import { Entity, Column, BaseEntity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user";

@Entity()
export class user_permissions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => Users)
    @Column()
    id_user: number

    @Column()
    resource: string

    @Column()
    action: string

    @Column({default: ""})
    scope: string

    @Column({default: ""})
    conditions: string
}
