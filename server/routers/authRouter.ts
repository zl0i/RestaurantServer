import express from 'express';
import { body } from '../middleware/schemaChecker';
import DefaultAuth from '../src/auth';

const router = express.Router();

router.post('/phone', [body({ phone: String })], DefaultAuth.viaPhone)

router.post('/code', [body({ phone: String, code: String })], DefaultAuth.viaCode);

router.post('/password', [body({ login: String, password: String })], DefaultAuth.viaPassword);

router.post('/token', [body({ token: String })], async (_req: express.Request, res: express.Response) => {
    try {
        res.status(401).end()
    } catch (error) {
        res.status(401).end();
    }
});

export default router
