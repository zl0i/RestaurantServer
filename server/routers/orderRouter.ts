import express from 'express';
import { Orders } from '../entity/orders';
import scopeValidator from '../middleware/scopeVaildator'


const router = express.Router();

router.get('/', [scopeValidator('orders:get')], async (req: express.Request, res: express.Response) => {
  try {
    res.json(await Orders.find(req.context?.condition));
  } catch (e) {
    res.status(500).json({ result: 'error' });
  }
});


/*
router.post('/', [checker.check('body', { phoneUser: String, phoneOrder: String, address: Object, menu: Array, shop_id: String, comment: String })],
  async (req, res) => {
    try {
      await helpOrders.verifyUserData(req.body.phoneUser, req.body.address);

      let user = await helpOrders.updateUserAddress(req.body.phoneUser, req.body.address);
      let shop = await Shop.findOne({ _id: req.body.shop_id });

      let items = await helpOrders.calcCostMenu(req.body.shop_id, req.body.menu);

      helpOrders.verifyOrderData(items, req.body.menu, shop);

      let order_id = uuidv4();
      let delivery_cost = 100//shop.delivery_city_cost[req.body.address.city];

      let total_cost = items.cost + delivery_cost;
      let payment = await yookassa.createPaymentOrder(total_cost, order_id, 'Ваш заказ');

      let orderConfig = {
        order_id: order_id,
        user_id: user._id,
        shop_id: shop._id,
        payment_id: payment.payment_id,
        menu: req.body.menu,
        menu_cost: items.cost,
        delivery_cost: delivery_cost,
        total_cost: total_cost,
        address_delivery: req.body.address,
        phoneOrder: req.body.phoneOrder,
        comment: req.body.comment,
      };
      await helpOrders.createOrder(orderConfig);

      res.json({
        payment_token: payment.token,
        order_id: order_id,
        total: total_cost,
      });
    } catch (e) {
      res.status(400).json({
        result: e.message,
      });
    }
  });

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
