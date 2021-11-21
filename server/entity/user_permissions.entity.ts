import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne, RelationId, JoinColumn } from "typeorm";
import { Users } from "./user.entity";

@Entity()
export class UserPermissions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((permissions: UserPermissions) => permissions.user)
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

    @ManyToOne(() => Users, user => user.id)
    @JoinColumn({ name: 'id_user' })
    user: Users
}
