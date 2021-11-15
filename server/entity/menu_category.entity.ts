import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany, ManyToOne, RelationId, JoinColumn } from "typeorm";
import Menu from "./menu.entity";
import Points from "./points.entity";


@Entity()
export default class MenuCategory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: null })
    icon: string

    @RelationId((category: MenuCategory) => category.points)
    @Column()
    id_point: number

    @ManyToOne(() => Points, point => point.id)
    @JoinColumn({ name: "id_point" })
    points: Points

    @Column({ default: '', length: 1000 })
    description: string

    @OneToMany(() => Menu, menu => menu.category)
    menu: Menu[]

    async remove(): Promise<this> {
        await Menu.delete({ id_category: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const categories = await MenuCategory.find(criteria)
        for (const c of categories) {
            await Menu.delete({ id_category: c.id })
        }
        return super.delete(criteria, options)
    }
}



