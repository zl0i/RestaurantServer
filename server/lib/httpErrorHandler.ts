import express from "express";
import { FindRelationsNotFoundError, TypeORMError } from "typeorm";
import { HttpError } from "./errors";

const IS_DEV = process.env['NODE_ENV'] == 'dev'

export default class HttpErrorHandler {
    static handle(error: any, res: express.Response) {
        console.error(error)
        if (error instanceof HttpError) {
            res.status(error.code).json({
                result: 'error',
                mesage: error.message
            });
        } else if (error instanceof FindRelationsNotFoundError) {
            res.status(400).json({
                result: 'error',
                message: 'relation not found'
            })
        } else if (error instanceof TypeORMError) {
            res.status(500).json({
                result: 'error',
                message: IS_DEV ? error.message : 'DB error'
            })
        } else {
            res.status(500).json({
                result: 'error',
                message: IS_DEV ? error.message : 'Internal Server Error'
            })
        }
    }
}