import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne, RelationId, JoinColumn } from "typeorm";
import { Users } from "./user.entity";

@Entity()
export class user_permissions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((permissions: user_permissions) => permissions.user)
    @Column()
    id_user: number

    @Column()
    resource: string

    @Column()
    action: string

    @Column({ default: "" })
    scope: string

    @Column({ default: "" })
    conditions: string

    @Column({default: '[]'})
    forbid_fields: string

    @ManyToOne(() => Users, user => user.id)
    @JoinColumn({ name: 'id_user' })
    user: Users
}
