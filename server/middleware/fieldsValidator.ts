import express from 'express'

export function forbidFields(req: express.Request, data: any[]) {
    for (let i = 0; i < data.length; i++) {
        for (const name of req.context.forbidFields) {
            delete data[i][name]
        }
    }
    return data
}