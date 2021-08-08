import express from 'express';
import { body } from '../middleware/schemaChecker';
import DefaultAuth from '../src/defautAuth';

const router = express.Router();

router.post('/phone', [body({ phone: String })], DefaultAuth.viaPhone)

router.post('/code', [body({ phone: String, code: String })], DefaultAuth.viaCode);

router.post('/password', [body({ login: String, password: String })], DefaultAuth.viaPassword);

router.post('/token', [body({ token: String })], DefaultAuth.viaToken);

export default router
