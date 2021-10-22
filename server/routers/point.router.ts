import express from 'express';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware'
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import PointService from '../services/points.service';

const router = express.Router();

router.get('/',
  [
    cache(180)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const provide = new DataProvider('Points')
      await provide.index(req, res, {})
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
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
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });

router.patch('/:id',
  [
    allow(Resources.points, Actions.update)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const data = { ...req.body, icon: req.files?.icon }
      const point = await PointService.update(Number(req.params.id), data)
      res.json(point)
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });

router.delete('/:id',
  [
    allow(Resources.points, Actions.delete)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const point = await PointService.delete(Number(req.params.id))
      res.json(point)
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });


export default router;
