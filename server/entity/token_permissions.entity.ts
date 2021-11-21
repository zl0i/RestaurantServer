import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, RelationId, ManyToOne, JoinColumn } from "typeorm";
import { Tokens } from "./tokens.entity";

@Entity()
export class TokenPermissions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @RelationId((permissions: TokenPermissions) => permissions.token)
    @Column()
    id_token: number

    @Column()
    resource: string

    @Column()
    action: string

    @Column({ default: null })
    scope: string

    @Column({ default: null })
    conditions: string

    @ManyToOne(() => Tokens, token => token.permissions)
    @JoinColumn({ name: 'id_token' })
    token: Tokens
}
