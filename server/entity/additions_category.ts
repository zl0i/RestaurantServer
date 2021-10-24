import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
import Additions from "./additions";
import Menu from "./menu";


export enum AdditionsMode {
    single = 'single',
    many = 'many'
}

@Entity()
export default class AdditionsCategory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => Menu, menu => menu.id) //TO DO ManyToMany
    id_menu: Menu | number

    @Column()
    mode: AdditionsMode

    @OneToMany(() => Additions, additions => additions.id_category)
    additions: Additions[]

    async remove(): Promise<this> {
        Additions.delete({ id_category: this })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const additionsCategory = await AdditionsCategory.find(criteria)
        for (const a of additionsCategory) {
            Additions.delete({ id_category: a })
        }
        return super.delete(criteria, options)
    }
}



