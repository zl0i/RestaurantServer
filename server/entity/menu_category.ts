import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, DeleteResult, FindConditions, ObjectType, RemoveOptions, OneToMany } from "typeorm";
import ObjectStorage from "../src/storage";
import Menu from "./menu";


@Entity()
export default class MenuCategory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: null })
    icon: string

    @Column()
    id_point: number

    @Column({ default: '', length: 1000 })
    description: string

    @OneToMany(() => Menu, menu => menu.category)
    menu: Menu[]

    async remove(): Promise<this> {
        Menu.delete({ category: this.id })
        if (this.icon)
            await ObjectStorage.deleteImage(this.icon)
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const categories = await MenuCategory.find(criteria)
        for (const c of categories) {
            Menu.delete({ category: c.id })
            if (c.icon)
                await ObjectStorage.deleteImage(c.icon)
        }
        return super.delete(criteria, options)
    }
}



