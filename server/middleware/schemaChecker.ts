import express from 'express'

function typeChecker(obj: any, schema: any) {
    Object.keys(schema).forEach((el: string) => {
        if (obj[el] == undefined)
            throw new Error(`${el} don't need undefined`);
        if (typeof obj[el] != typeof schema[el]())
            throw new Error(`${el} should be ${typeof schema[el]()}`);
    })
}

export function body(schema: object) {
    return (req: express.Request, res: express.Response, next: Function): void => {
        try {
            typeChecker(req.body, schema)
            next();
        } catch (e) {
            res.status(400).json({
                result: "error",
                message: e.message
            })
        }
    }
}

export function params(schema: object) {
    return (req: express.Request, res: express.Response, next: Function): void => {
        try {
            typeChecker(req.params, schema)
            next();
        } catch (e) {
            res.status(400).json({
                result: "error",
                message: e.message
            })
        }
    }
}
