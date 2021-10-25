import express, { Router } from 'express';
import OAuthService from '../services/oauth.service';
import { query } from '../middleware/schemaChecker';
import HttpErrorHandler from '../lib/httpErrorHandler';

const router = Router()

router.get('/',
    [
        query({ method: String, device: String })
    ],
    (req: express.Request, res: express.Response) => {
        try {
            const method = req.query['method'] as string
            const device = req.query['device'] as string
            res.redirect(OAuthService.redirectUser(method, device))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.get('/code',
    async (req: express.Request, res: express.Response) => {
        try {
            const code = req.query['code'] as string;
            const state = req.query['state'] as string
            res.redirect(await OAuthService.handleCode(code, state))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })



export default router;