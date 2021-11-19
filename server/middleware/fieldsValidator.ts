import express from 'express'
import { ForbiddenError } from '../lib/errors'
import HttpErrorHandler from '../lib/httpErrorHandler'

export function forbidFieldsData(req: express.Request, data: any[]) {
    for (let i = 0; i < data.length; i++) {
        for (const field of req.context.forbidFields) {
            delete data[i][field]
        }
    }
    return data
}

export function forbidFieldsBody() {
    return function (req: express.Request, res: express.Response, next: Function) {
        try {
            for (const field of req.context.forbidFields) {
                if (req.body[field])
                    throw new ForbiddenError(`You cannot change field '${field}'`)
            }
            next()
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    }
}