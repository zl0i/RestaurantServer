import { Any, BaseEntity, Between, Equal, FindManyOptions, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm";
import express from 'express'
import { BadRequestError } from "./httpErrorHandler";


interface Sortins {
    [key: string]: "ASC" | "DESC" | 1 | -1
}

export default class FindOptionsParser {

    static parse(req: express.Request, out_condition?: any, relations?: string[]): FindManyOptions<BaseEntity> {
        const pagination = FindOptionsParser.parsePagination(req)
        const expand = FindOptionsParser.parseExpand(req, relations)
        const sorting = FindOptionsParser.parseSort(req)
        const in_condition = FindOptionsParser.parseFilter(req)

        return {
            where: {
                ...in_condition,
                ...out_condition,
                ...req.context?.condition?.findCondition
            },
            relations: expand,
            ...pagination,
            order: sorting as Sortins
        }
    }


    private static buildNestedCondition(arr: string[], value: any) {
        const name = arr.shift()
        if (name) {
            const obj = {}
            obj[name] = this.buildNestedCondition(arr, value)
            return obj
        } else {
            return value
        }
    }

    private static buildNestedAdvCondition(arr: string[], method: string, value: any) {
        const name = arr.shift()
        if (name) {
            const obj = {}
            obj[name] = this.buildNestedAdvCondition(arr, method, value)
            return obj
        } else {
            switch (method) {
                case 'eq': {
                    return Equal(value)
                }
                case 'le': {
                    return LessThanOrEqual(value)
                }
                case 'ls': {
                    return LessThan(value)
                }
                case 'ge': {
                    return MoreThanOrEqual(value)
                }
                case 'gr': {
                    return MoreThan(value)
                }
                case 'ne': {
                    return Not(value)
                }
                case 'lk': {
                    return Like(value)
                }
                case 'bt': {
                    const value1 = value.split(',')[0].trim()
                    const value2 = value.split(',')[1].trim()
                    return Between(value1, value2)
                }
                case 'in': {
                    return In(value.split(',').map(item => item.trim()))
                }
                case 'any': {
                    return Any(value.split(',').map(item => item.trim()))
                }
                default: {
                    throw new BadRequestError('The filter not supported')
                }
            }
        }
    }

    private static parsePagination(req: express.Request) {
        const pagination = {}
        if (req.query['page'] || req.query['per-page']) {
            if (req.query['page'] && req.query['per-page']) {
                pagination['take'] = Number(req.query['per-page'])
                pagination['skip'] = Number(req.query['per-page']) * (Number(req.query['page']) - 1)
                delete req.query['per-page']
                delete req.query['page']
            } else {
                throw new BadRequestError('page and per-page must be definite')
            }
        }
        if (pagination['take'] < 1 || pagination['skip'] < 0) {
            throw new BadRequestError('page and per-page must be greater than zero')
        }
        return pagination;
    }

    private static parseExpand(req: express.Request, relations: string[]) {
        const expand: string[] = Array.from(relations ?? [])
        if (req.query.expand) {
            expand.push(...String(req.query.expand).split(','))
            delete req.query.expand
        }
        return expand
    }

    private static parseFilter(req: express.Request) {
        const condition: object = {}

        const filter = req.query.filter
        delete req.query.filter
        if (filter) {
            for (const key of Object.keys(filter)) {
                const start = String(filter[key]).indexOf('(')
                const end = String(filter[key]).indexOf(')')
                const method = String(filter[key]).substring(0, start)
                const value = String(filter[key]).substring(start + 1, end)
                const names = key.split('.')
                condition[names.shift()] = this.buildNestedAdvCondition(names, method, value)
            }
        }

        for (const q of Object.keys(req.query)) {
            if (q.includes('.')) {
                const names = q.split('.')
                const name = names.shift()
                condition[name] = this.buildNestedCondition(names, Number(req.query[q]))
            } else {
                condition[q] = req.query[q]
            }
        }
        return condition
    }

    private static parseSort(req: express.Request) {
        const obj = req.query.sort
        delete req.query.sort
        return obj
    }
}

