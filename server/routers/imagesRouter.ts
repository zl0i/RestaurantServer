import express from 'express';
import scopeVaildator from '../middleware/scopeVaildator';
import { cache } from '../middleware/cacheMiddleware';

import ObjectStorage from '../src/storage'
import { Actions, Resources } from '../lib/permissions';

const router = express.Router();

router.get('/', [scopeVaildator(Resources.menu, Actions.read)], ObjectStorage.listImages);
router.get('/:file', [cache(7200)], ObjectStorage.streamImage);
router.post('/:file', [scopeVaildator(Resources.menu, Actions.create)], ObjectStorage.putImage);

export default router;
