import express from 'express';
import Address from '../models/addressModel';

const router = express.Router();

router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    res.json(await Address.find({}));
  } catch (error) {
    res.status(500).end();
  }
});

export default router
