import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm"
import Additions from "./additions"


@Entity()
export class AdditionsRecipes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @RelationId((recipe: AdditionsRecipes) => recipe.addition)
    @Column()
    id_addition: number
    
    @Column({ length: 5000 })
    recipe: string

    @OneToOne(() => Additions, add => add.id)
    @JoinColumn({ name: "id_addition" })
    addition: Additions
}