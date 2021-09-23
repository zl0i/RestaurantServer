import express from 'express';
import scopeVaildator from '../middleware/scopeVaildator';
import { cache } from '../middleware/cacheMiddleware';

import ObjectStorage from '../src/storage'

const router = express.Router();

router.get('/', [scopeVaildator('menu:read')], ObjectStorage.listImages);
router.get('/:file', [cache(7200)], ObjectStorage.streamImage);
router.post('/:file', [scopeVaildator('users:create')], ObjectStorage.putImage);

export default router;
