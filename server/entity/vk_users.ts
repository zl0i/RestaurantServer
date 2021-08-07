import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne } from "typeorm";
import { Users } from "./user";

@Entity()
export class vk_users extends BaseEntity {

    @OneToOne(() => Users)
    @PrimaryColumn()
    id_user: number;

    @Column({default: ""})
    vk_id: string;

    @Column({default: ""})
    vk_token: string;

}
