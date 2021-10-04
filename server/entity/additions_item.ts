import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import Additions from "./additions";


@Entity()
export default class AdditionsItem extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Additions, addition => addition.id)
    id_additions: Additions

    @Column()
    name: string

    @Column()
    cost: number
}



