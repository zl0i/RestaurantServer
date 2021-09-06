import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class ya_users extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_user: number;

    @Column()
    sid: string;

    @Column({ default: "" })
    login: string;

    @Column({ default: "" })
    email: string;

    @Column({ default: "" })
    access_token: string;

    @Column({ default: "" })
    refresh_token: string;
}
