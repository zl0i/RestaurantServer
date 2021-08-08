import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne } from "typeorm";
import { Users } from "./user";

@Entity()
export class vk_users extends BaseEntity {

    @OneToOne(() => Users)
    @PrimaryColumn()
    id_user: number;

    @Column({default: ""})
    id: string;

    @Column({default: ""})
    login: string;

    @Column({default: ""})
    access_token: string;

    @Column({default: ""})
    refresh_token: string;
}
