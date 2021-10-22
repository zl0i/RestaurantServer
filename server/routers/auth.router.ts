import express from 'express';
import { body } from '../middleware/schemaChecker';
import DefaultAuth from '../services/auth.service';

const router = express.Router();

router.post('/phone', [body({ phone: String })], DefaultAuth.viaPhone)

router.post('/code', [body({ phone: String, code: String })], DefaultAuth.viaCode);

router.post('/password', [body({ login: String, password: String })], DefaultAuth.viaPassword);

router.post('/token', DefaultAuth.viaToken);

export default router
