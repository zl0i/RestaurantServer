import { getManager } from "typeorm";
import express from 'express'


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

    async index(req: express.Request, res: express.Response, condition: object = {}, relations: string[] = []) {
        const pagination = {}
        if (req.query['page'] || req.query['per-page']) {
            if (req.query['page'] && req.query['per-page']) {
                pagination['take'] = Number(req.query['per-page'])
                pagination['skip'] = Number(req.query['per-page']) * (Number(req.query['page']) - 1)
                delete req.query['per-page']
                delete req.query['page']
            } else {
                return res.status(400).json({
                    result: 'page and per-page must be definite'
                })
            }
        }
        if (pagination['take'] < 1 || pagination['skip'] < 0) {
            return res.status(400).json({
                result: 'page and per-page must be greater than zero'
            })
        }
        let expand: string[] = new Array()
        if (req.query.expand) {
            expand = String(req.query.expand).split(',')
            delete req.query.expand
        }
        expand.push(...relations)

        const delete_filed: string[] = new Array()
        const v_condition: object = {}
        for (const q of Object.keys(req.query)) {
            if (q.includes('.')) {
                const names = q.split('.')
                const name = names.shift()
                delete_filed.push(name)
                v_condition[name] = this.buildNestedCondition(names, Number(req.query[q]))
            } else {
                v_condition[q] = req.query[q]
            }
        }

        const model = (await this.find({
            where: {
                ...v_condition,
                ...condition
            },
            relations: expand,
            ...pagination
        })).flat()
        const count = Number(model.pop())

        for (const md of model) {
            for (const df of delete_filed) {
                delete md[df]
            }
        }

        res.json({
            data: model,
            meta: {
                lenght: count,
                pages: Math.ceil(count / pagination['take']) || (count > 0 ? 1 : 0)
            }
        })
    }
}




