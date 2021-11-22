import express from "express";
import { FindRelationsNotFoundError, TypeORMError } from "typeorm";

const IS_DEV = process.env['NODE_ENV'] == 'dev'


export class HttpError extends Error { code: number }

export class BadRequestError extends HttpError { code = 400 } //400
export class UnauthorizedError extends HttpError { code = 401 } //401
export class ForbiddenError extends HttpError { code = 403 } //403
export class NotFoundError extends HttpError { code = 404 } //404
export class InternalError extends HttpError { code = 500 } //500
export class NotImplementedError extends HttpError { code = 501 } //501
export class UnknownError extends HttpError { code = 520 } //520


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