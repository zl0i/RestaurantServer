import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, DeleteResult, FindConditions, ObjectType, RemoveOptions, ManyToMany, JoinTable } from "typeorm";
import Additions from "./additions.entity";
import Menu from "./menu.entity";


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

    @ManyToMany(() => Menu, menu => menu.id, { cascade: true })
    @JoinTable({
        name: 'menu_additions_category',
        joinColumn: {
            name: "id_additions_category",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "id_menu",
            referencedColumnName: 'id'
        }
    })
    menu: Menu[]

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



