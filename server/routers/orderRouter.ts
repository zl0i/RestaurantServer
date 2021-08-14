import express from 'express';
import Orders from '../entity/orders';
import scopeValidator from '../middleware/scopeVaildator'
import { body } from '../middleware/schemaChecker';
import YokassaAPI from '../src/yokassaAPI';
import OrderBuilder from '../src/orderBuilder';

const router = express.Router();

router.get('/', [scopeValidator('orders:get')], async (req: express.Request, res: express.Response) => {
  try {
    res.json(await Orders.find(req.context?.condition));
  } catch (e) {
    res.status(500).json({ result: 'error' });
  }
});

router.post(
  '/',
  [body({ id_point: Number, menu: Array }), scopeValidator('orders:create')],
  async (req: express.Request, res: express.Response) => {
    try {
      const order = await new OrderBuilder(req.context.user, req.body.menu, req.body.id_point)
        .address(req.body.address)
        .phone(req.body.phone)
        .build()
      res.json({
        id_order: order.order_id,
        payment_token: order.payment_token
      })
    } catch (error) {
      res.status(500).json(error.message)
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