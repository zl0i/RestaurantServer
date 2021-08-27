import express from 'express';
import scopeVaildator from '../middleware/scopeVaildator';

import ObjectStorage from '../src/storage'

const router = express.Router();

router.get('/', [scopeVaildator('menu:get')], ObjectStorage.listImages);
router.get('/:file', ObjectStorage.streamImage);

export default router;
