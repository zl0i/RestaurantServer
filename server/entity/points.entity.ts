import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany, JoinTable, ManyToMany } from "typeorm";
import MenuCategory from "./menu_category.entity";
import { UsersInfo } from "./users_info.entity";

@Entity()
export default class Points extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    address: string

    @Column({ default: null })
    lat: number

    @Column({ default: null })
    lon: string

    @Column({ default: 0 })
    delivery_cost: number

    @Column({ default: false })
    is_delivering: boolean

    @Column({ default: "" })
    icon: string

    @OneToMany(() => MenuCategory, category => category.point)
    categories: MenuCategory[]

    @ManyToMany(() => UsersInfo, user => user.points)
    @JoinTable({
        name: "users_points",
        joinColumn: {
            name: "id_point",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "id_user",
            referencedColumnName: "id"
        }
    })
    users: UsersInfo[]

    async remove(): Promise<this> {
        await MenuCategory.delete({ id_point: this.id })
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const points = await Points.find(criteria)
        for (const p of points) {
            await MenuCategory.delete({ id_point: p.id })
        }
        return super.delete(criteria, options)
    }
}
