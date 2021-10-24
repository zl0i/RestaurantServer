import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany } from "typeorm";
import ObjectStorage from "../src/storage";
import MenuCategory from "./menu_category";

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

    async remove(): Promise<this> {
        MenuCategory.delete({ point: this.id })
        if (this.icon)
            await ObjectStorage.deleteImage(this.icon)
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const points = await Points.find(criteria)
        for (const p of points) {
            MenuCategory.delete({ point: p.id })
            if (p.icon)
                await ObjectStorage.deleteImage(p.icon)
        }
        return super.delete(criteria, options)
    }
}
