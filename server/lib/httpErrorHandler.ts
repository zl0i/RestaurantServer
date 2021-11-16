import express from "express";
import { TypeORMError } from "typeorm";
import HttpError from "./httpError";

const IS_TEST = process.env['NODE_ENV'] == 'test'

export default class HttpErrorHandler {
    static handle(error: Error, res: express.Response) {
        console.error(error)
        if (error instanceof HttpError) {
            res.status(error.status).json({
                result: 'error',
                mesage: error.message
            });
        } else if (error instanceof TypeORMError) {
            res.status(500).json({
                result: 'error',
                message: IS_TEST ? 'DB error' : error.message
            })
        } else {
            res.status(500).json({
                result: 'error',
                message: IS_TEST ? 'Internal Server Error' : error.message
            })
        }
    }
}