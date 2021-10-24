import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import YokassaAPI from '../src/yokassaAPI';
import OrderService from '../services/orders.service';
import { cache } from '../middleware/cacheMiddleware';
import { In } from 'typeorm';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';

const router = express.Router();

router.get('/',
  [
    cache(60),
    allow(Resources.orders, Actions.read)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const condition: object = {}
      if (req.context?.condition.value.length > 0) {
        condition[req.context?.condition?.key] = In(req.context?.condition.value)
      }
      const provider = new DataProvider('Orders')
      await provider.index(req, res, condition)
    } catch (e) {
      res.status(500).json({ result: e.message });
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
      console.log(error)
      res.status(500).json({
        message: error.message
      })
    }
  })


router.delete(
  '/:id',
  [
    allow(Resources.orders, Actions.delete)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      await OrderService.delete(Number(req.params.id))
      res.json({
        result: 'ok'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: error.message
      })
    }
  })

router.post('/payment', YokassaAPI.handleHook)


/*
router.delete('/:id', async (req, res) => {
  try {
    let order = await ActiveOrders.findOne({ id: req.params.id });
    if (
      order.status === 'wait_payment' ||
      order.status === 'accepted' ||
      order.status === 'coocking'
    ) {
      await ActiveOrders.deleteOne({ id: req.params.id });
      res.json({
        result: 'ok',
      });
    } else {
      throw new Error('Order cannot be returned');
    }
  } catch (e) {
    res.status(400).json({
      result: e.message,
    });
  }
});
*/

export default router
