import {Router} from 'express';
import OAuthFlow from '../services/oauth.service';
import { query } from '../middleware/schemaChecker';

const router = Router()

router.get('/', [query({ method: String, device: String })], OAuthFlow.redirectUser);

router.get('/code', OAuthFlow.handleCode);

export default router;