import express from "express";
import HttpError from "./httpError";

export default class HttpErrorHandler {
    static handle(error: Error, res: express.Response) {
        console.log(error)
        if (error instanceof HttpError) {
            res.status(error.status).json({
                error: 'error',
                mesage: error.message
            });
        } else {
            res.status(500).json({
                message: error.message
            })
        }
    }
}