import express from 'express';
import HttpErrorHandler from '../lib/httpErrorHandler';
import { body } from '../middleware/schemaChecker';
import AuthService from '../services/auth.service';

const router = express.Router();

router.post('/phone',
    [
        body({ phone: String })
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const phone = req.body.phone as string
            res.json(await AuthService.viaPhone(phone))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })


router.post('/code',
    [
        body({ phone: String, code: String })
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const phone = req.body.phone as string
            const code = req.body.code as string
            res.json(await AuthService.viaCode(phone, code))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })


router.post('/password',
    [
        body({ login: String, password: String })
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const login = req.body.login as string
            const password = req.body.password as string
            res.json(await AuthService.viaPassword(login, password))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })


router.post('/token',
    async (req: express.Request, res: express.Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1]
            res.json(await AuthService.viaToken(token))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })



export default router
