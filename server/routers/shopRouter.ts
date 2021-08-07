import express from 'express';
import { Points } from '../entity/points';

const router = express.Router();

router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    res.json(await Points.find({}));
  } catch (error) {
    res.status(500).end();
  }
});

export default router;
