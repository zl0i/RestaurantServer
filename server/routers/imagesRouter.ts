import express from 'express';
import allow from '../middleware/permissionVaildator';
import { cache } from '../middleware/cacheMiddleware';
import ObjectStorage from '../src/storage'
import { Resources, Actions } from '../lib/permissionsBuilder';

const router = express.Router();

router.get('/', [allow(Resources.menu, Actions.read)], ObjectStorage.listImages);
router.get('/:file', [cache(7200)], ObjectStorage.streamImage);
router.post('/:file', [allow(Resources.menu, Actions.create)], ObjectStorage.putImage);

export default router;
