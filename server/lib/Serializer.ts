import { BaseEntity } from "typeorm";



export class Serializer {

    static serialize(data: BaseEntity[], count: number) {

        return {
            data: data,
            meta: {
                lenght: data.length,
                pages: Math.ceil(count / data.length) || (count > 0 ? 1 : 0)
            }
        }
    }
}