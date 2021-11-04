import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, DeleteResult, FindConditions, ObjectType, RemoveOptions, RelationId, JoinColumn } from "typeorm";
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

    @RelationId((ad: AdditionsCategory) => ad.menu)
    @Column()
    id_menu: number

    @ManyToOne(() => Menu, menu => menu.id) //TO DO ManyToMany
    @JoinColumn({ name: 'id_menu' })
    menu: Menu

    @Column()
    mode: AdditionsMode

    @OneToMany(() => Additions, additions => additions.category)
    additions: Additions[]

    async remove(): Promise<this> {
        Additions.delete({ id_category: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const additionsCategory = await AdditionsCategory.find(criteria)
        for (const ad of additionsCategory) {
            Additions.delete({ id_category: ad.id })
        }
        return super.delete(criteria, options)
    }
}



