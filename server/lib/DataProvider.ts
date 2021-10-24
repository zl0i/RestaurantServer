import { getManager } from "typeorm";
import express from 'express'
import HttpError from "./httpError";


export default class DataProvider {

    _model: string;

    constructor(model: string) {
        this._model = model
    }

    private async find(condition: object) {
        const manager = getManager()
        return await manager.findAndCount(this._model, condition)
    }

    private buildNestedCondition(arr: string[], value: any) {
        const name = arr.shift()
        if (name) {
            const obj = {}
            obj[name] = this.buildNestedCondition(arr, value)
            return obj
        } else {
            return value
        }
    }

    async index(req: express.Request, out_condition: object = {}, relations: string[] = []) {
        const pagination = this.parsePagination(req)

        const expand = this.parseExpand(req, relations)
        const [in_condition, delete_field] = this.parseFilter(req)

        const model = (await this.find({
            where: {
                ...in_condition,
                ...out_condition
            },
            relations: expand,
            ...pagination
        })).flat()

        const count = Number(model.pop())
        for (const md of model) {
            for (const df of delete_field as string[]) {
                delete md[df]
            }
        }

        return {
            data: model,
            meta: {
                lenght: count,
                pages: Math.ceil(count / pagination['take']) || (count > 0 ? 1 : 0)
            }
        }
    }

    private parsePagination(req: express.Request) {
        const pagination = {}
        if (req.query['page'] || req.query['per-page']) {
            if (req.query['page'] && req.query['per-page']) {
                pagination['take'] = Number(req.query['per-page'])
                pagination['skip'] = Number(req.query['per-page']) * (Number(req.query['page']) - 1)
                delete req.query['per-page']
                delete req.query['page']
            } else {
                throw new HttpError(400, 'page and per-page must be definite')
            }
        }
        if (pagination['take'] < 1 || pagination['skip'] < 0) {
            throw new HttpError(400, 'page and per-page must be greater than zero')
        }
        return pagination;
    }

    private parseExpand(req: express.Request, relations: string[]) {
        let expand: string[] = new Array()
        if (req.query.expand) {
            expand = String(req.query.expand).split(',')
            delete req.query.expand
        }
        expand.push(...relations)
        return expand
    }

    private parseFilter(req: express.Request) {
        const delete_filed: string[] = new Array()
        const condition: object = {}
        for (const q of Object.keys(req.query)) {
            if (q.includes('.')) {
                const names = q.split('.')
                const name = names.shift()
                delete_filed.push(name)
                condition[name] = this.buildNestedCondition(names, Number(req.query[q]))
            } else {
                condition[q] = req.query[q]
            }
        }
        return [condition, delete_filed]
    }
}




