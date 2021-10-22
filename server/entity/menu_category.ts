import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, DeleteResult, FindConditions, ObjectType, RemoveOptions } from "typeorm";
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

    async remove(): Promise<this> {
        Menu.delete({ id_category: this.id })
        if (this.icon)
            await ObjectStorage.deleteImage(this.icon)
        return super.remove()
    }

    static async delete<T extends BaseEntity>(this: ObjectType<T>, criteria: FindConditions<T>, options?: RemoveOptions): Promise<DeleteResult> {
        const categories = await MenuCategory.find(criteria)
        for (const c of categories) {
            Menu.delete({ id_category: c.id })
            if (c.icon)
                await ObjectStorage.deleteImage(c.icon)
        }
        return super.delete(criteria, options)
    }
}



