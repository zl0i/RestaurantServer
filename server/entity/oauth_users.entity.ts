import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class oauth_users extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_user: number;

    @Column()
    oauth_id: string;

    @Column({ default: "" })
    login: string;

    @Column({ default: "" })
    email: string;

    @Column({ default: "" })
    access_token: string;

    @Column({ default: "" })
    refresh_token: string;

    @Column()
    service: string
}
