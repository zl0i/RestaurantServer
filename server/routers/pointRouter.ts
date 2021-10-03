import express from 'express';
import { UploadedFile } from 'express-fileupload';
import Points from '../entity/points';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware'
import { body } from '../middleware/schemaChecker';
import scopeValidator from '../middleware/scopeVaildator'
import ObjectStorage from '../src/storage';

const router = express.Router();

router.get('/', [cache(180)], async (req: express.Request, res: express.Response) => {
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
    scopeValidator(Resources.points, Actions.create),
    body({ name: String, address: String, is_delivering: String })
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const point = new Points()
      point.name = req.body.name
      point.address = req.body.address
      point.lat = req.body.lat
      point.lon = req.body.lon
      point.delivery_cost = req.body.delivery_cost || 0
      point.is_delivering = req.body.is_delivering == 'true'
      await point.save()
      if (!!req.files?.icon) {
        const file = req.files.icon as UploadedFile
        point.icon = await ObjectStorage.uploadImage(file as UploadedFile, point.id) as string
        await point.save()
      }
      res.json(point)
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });

router.patch('/:id', [scopeValidator(Resources.points, Actions.update)],
  async (req: express.Request, res: express.Response) => {
    try {
      const point = await Points.findOne({ id: Number(req.params.id) })
      point.name = req.body.name || point.name
      point.address = req.body.address || point.address
      point.lat = req.body.lat || point.lat
      point.lon = req.body.lon || point.lon
      point.delivery_cost = req.body.delivery_cost || point.delivery_cost
      point.is_delivering = req.body.is_delivering == 'true' || point.is_delivering
      if (!!req.files?.icon) {
        const file = req.files.icon as UploadedFile
        point.icon = await ObjectStorage.uploadImage(file as UploadedFile, point.id) as string
      }
      await point.save()
      res.json(point)
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });

router.delete('/:id',
  [scopeValidator(Resources.points, Actions.delete)],
  async (req: express.Request, res: express.Response) => {
    try {
      const point = await Points.findOne({ id: Number(req.params.id) })
      await point.remove()
      res.json(point)
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e.message
      })
    }
  });


export default router;
