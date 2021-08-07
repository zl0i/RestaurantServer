import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne } from "typeorm";
import { Users } from "./user";

@Entity()
export class ya_users extends BaseEntity {

    @OneToOne(() => Users)
    @PrimaryColumn()
    id_user: number;

    @Column({default: ""})
    yandex_id: string;

    @Column({default: ""})
    yandex_login: string;

    @Column({default: ""})
    yandex_email: string;

    @Column({default: ""})
    yandex_access_token: string;

    @Column({default: ""})
    yandex_refresh_token: string;
}
