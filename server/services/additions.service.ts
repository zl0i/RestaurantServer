
import { BadRequestError } from "../lib/errors"
import Additions from "../entity/additions.entity"
import AdditionsCategory from "../entity/additions_category.entity"
import { FindManyOptions } from "typeorm"


export default class AdditionsService {

    static async read(options: FindManyOptions<Additions>) {
        return await Additions.find(options)
    }

    static async create(data: any) {
        const category = await AdditionsCategory.findOne({ id: data.id_additions })
        if (!category)
            throw new BadRequestError('Additions Category not found')

        const item = new Additions()
        item.name = data.name
        item.cost = data.cost
        item.id_category = category.id
        return await item.save()
    }

    static async update(id: number, data: any) {
        const item = await Additions.findOne({ id })
        item.name = data.name || item.name
        item.cost = data.cost || item.cost
        if (data.id_additions) {
            const category = await AdditionsCategory.findOne({ id: data.id_additions })
            if (category)
                throw new BadRequestError('Cannot update category')

            item.id_category = category.id
        }
        return await item.save()
    }

    static async delete(id: number) {
        const result = await Additions.delete({ id })
        if (result.affected == 0)
            throw new BadRequestError('Addition not found')

        return result
    }
}