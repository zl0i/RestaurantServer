import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export default class Points extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    address: string

    @Column({default: null})
    lat: number

    @Column({default: null})
    lon: string

    @Column({default: 0})
    delivery_cost: number

    @Column({default: false})
    is_delivering: boolean

    @Column({default: ""})
    icon: string
}
