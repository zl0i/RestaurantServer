import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm"
import Menu from "./menu"


@Entity()
export class MenuRecipes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((recipe: MenuRecipes) => recipe.menu)
    @Column()
    id_menu: number

    @Column({ length: 5000 })
    recipe: string

    @OneToOne(() => Menu, menu => menu.id)
    @JoinColumn({ name: "id_menu" })
    menu: Menu
}