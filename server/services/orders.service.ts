
import Menu from '../entity/menu.entity';
import { Users } from '../entity/user.entity';
import Orders from '../entity/orders.entity'
import { createQueryBuilder, In } from 'typeorm';
import AdditionsCategory from '../entity/additions_category.entity';
import YokassaAPI from '../src/yokassaAPI';
import { DomainError, NotFoundError } from '../lib/errors';
import Additions from '../entity/additions.entity';
import OrdersPayment from '../entity/orders_payment.entity';


export default class OrderService {

  static async create(user: Users, data: any) {
    const req_ids_menu: number[] = Array.from(data.menu).map(m => m['id'])
    const menu = await Menu.find({ id: In(req_ids_menu) })

    if (req_ids_menu.length != menu.length)
      throw new NotFoundError('Any menu is undefined')

    for (const item of menu) {
      const req_item_menu = Array.from(data.menu).find(el => el['id'] === item.id)
      item.qty = Number(req_item_menu['count'])
      if (req_item_menu['additions'] && req_item_menu['additions'].length > 0) {
        const req_ids_additions = Array.from(req_item_menu['additions']).map(add => add['id'])
        item.additions_category = await OrderService.checkAndReturnAddtions(item, req_ids_additions);
      }
    }
    const order = new Orders(menu, user)
    order.comment = data.comment
    await order.save()

    //TODO: catch if crash create payment
    const payment = await YokassaAPI.createPaymentOrder(order.total, 'Your order')
    const orderPayment = new OrdersPayment(order.id, payment.confirmation_token, payment.payment_id, payment.idempotence_key)
    await orderPayment.save()

    return {
      ...order,
      confirmation_token: payment.confirmation_token
    }
  }

  static async delete(id: number) {
    const result = await Orders.delete({ id })
    if (result.affected == 0)
      throw new NotFoundError('Order not found')

    return result
  }



  private static async checkAndReturnAddtions(menu: Menu, ids_additions: number[]) {

    const req_additions = await createQueryBuilder()
      .select('mac.*, ac.mode, ad.`id` as `id_addition`, ad.cost')
      .from('menu_additions_category', 'mac')
      .leftJoin('additions_category', 'ac', 'ac.id = mac.id_additions_category')
      .leftJoin('additions', 'ad', 'mac.id_additions_category = ad.id_category')
      .leftJoin('menu', 'm', 'm.id = mac.id_menu')
      .where('ad.id in (:...id)', { id: ids_additions })
      .andWhere('m.id = :menu', { menu: menu.id })
      .getRawMany();

    if (req_additions.length != ids_additions.length)
      throw new NotFoundError('Any additions is undefined')

    menu.additions_category = new Array()
    for (const item of req_additions) {

      const category = menu.additions_category.find(cat => cat.id === item['id_additions_category'])

      if (category) {
        if (category.mode === 'many') {
          category.additions.push({
            id: item['id_addition'],
            cost: item['cost'],
            qty: menu.qty
          } as Additions)
        } else {
          throw new DomainError(`Additions category ${item['id_additions_category']} is single`)
        }
      } else {
        menu.additions_category.push({
          id: item['id_additions_category'],
          mode: item['mode'],
          additions: [{
            id: item['id_addition'],
            cost: item['cost'],
            qty: menu.qty
          }] as Additions[]
        } as AdditionsCategory)
      }
    }
    return menu.additions_category
  }

}
