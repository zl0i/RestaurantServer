import express from 'express';
import { Resources, Actions } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware'
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import PointService from '../services/points.service';
import HttpErrorHandler from '../lib/httpErrorHandler';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/',
  [
    cache(180)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const options = FindOptionsParser.parse(req)
      res.json(await PointService.read(options))
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.post('/',
  [
    allow(Resources.points, Actions.create),
    body({ name: String, address: String, is_delivering: String })
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const data = { ...req.body, icon: req.files?.icon }
      const point = await PointService.create(data)
      res.json(point)
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.patch('/:id',
  [
    allow(Resources.points, Actions.update, 'id')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const data = { ...req.body, icon: req.files?.icon }
      const point = await PointService.update(Number(req.params.id), data)
      res.json(point)
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.delete('/:id',
  [
    allow(Resources.points, Actions.delete, 'id')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      await PointService.delete(Number(req.params.id))
      res.json({ result: 'ok' })
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });


export default router;
