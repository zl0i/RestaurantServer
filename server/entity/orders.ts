import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from "typeorm";
import { Points } from "./points";
import { Users } from "./user";

@Entity()
export class Orders extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cost: number

    @Column({ default: null })
    date: Date

    @OneToOne(() => Points)
    @Column()
    id_point: number


    @OneToOne(() => Users)
    @Column()
    id_user: number
}
