import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";
import { Tokens } from "./tokens";

@Entity()
export class token_permissions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Tokens)
    @Column()
    id_token: number

    @Column()
    resource: string

    @Column()
    action: string

    @Column({default: null})
    scope: string

    @Column({default: null})
    conditions: string
}
