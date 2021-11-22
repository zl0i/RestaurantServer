import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import YokassaAPI from '../src/yokassaAPI';
import OrderService from '../services/orders.service';
import { cache } from '../middleware/cacheMiddleware';
import { Resources, Actions } from '../lib/permissionsBuilder';
import HttpErrorHandler from '../lib/httpErrorHandler';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.post('/payment', YokassaAPI.handleHook)

router.get('/',
  [
    cache(10),
    allow(Resources.orders, Actions.read)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const options = FindOptionsParser.parse(req)
      res.json(await OrderService.read(options))
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.post(
  '/',
  [
    body({ menu: Array }),
    allow(Resources.orders, Actions.create)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const order = await OrderService.create(req.context.user, req.body)
      res.json(order)
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  })


router.delete('/:id',
  [
    allow(Resources.orders, Actions.delete, 'id')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      await OrderService.delete(Number(req.params.id))
      res.json({ result: 'ok' })
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  })



export default router
