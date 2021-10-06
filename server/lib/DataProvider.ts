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

        const model = await this.find({
            where: {
                ...req.query,
                ...condition
            },
            relations: expand,
            ...pagination
        })
        const count = Number(model.pop())
        res.json({
            data: model.flat(),
            meta: {
                lenght: count,
                pages: Math.ceil(count / pagination['take']) || 1
            }
        })
    }
}




