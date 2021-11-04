
import Menu from '../entity/menu';
import { Users } from '../entity/user';
import Orders from '../entity/orders'
import { createQueryBuilder, In } from 'typeorm';
import Additions from '../entity/additions';
import AdditionsCategory from '../entity/additions_category';
import YokassaAPI from '../src/yokassaAPI';


export default class OrderService {

  static async create(user: Users, data: any) {
    const ids: number[] = Array.from(data.menu).map(m => m['id'])
    const menu = await Menu.find({ id: In(ids) })

    if (ids.length != menu.length)
      throw new Error('any menu is undefined')

    for (const m of menu) { //TO DO refractor
      const req_menu = Array.from(data.menu).find(mn => mn['id'] === m.id)
      m.qty = Number(req_menu['count'])
      if (req_menu['additions']) {
        const ad_ids = Array.from(req_menu['additions']).map(ad => ad['id'])
        if (ad_ids.length > 0) {
          const ad_cat = await createQueryBuilder()
            .select('ad.*, ac.mode')
            .from('additions_category', 'ac')
            .leftJoin('additions', 'ad', 'ad.id_category = ac.id')
            .where('ad.id in (:...id)', { id: ad_ids })
            .andWhere('ac.id_menu = :menu', { menu: m.id })
            .getRawMany();

          console.log(ad_cat)

          if (ad_cat.length != ad_ids.length)
            throw new Error('any additions is undefined')

          for (const ad of ad_cat) {
            let category: AdditionsCategory
            if (m.additions_category) {
              category = m.additions_category.find(ac => ac.id === ad.idCategoryId)
              if (!category) {
                const num = m.additions_category.push({
                  mode: ad.mode,
                  additions: []
                } as AdditionsCategory)
                category = m.additions_category[num - 1]
              }
            } else {
              m.additions_category = new Array()
              m.additions_category.push({
                id: ad.idCategoryId,
                mode: ad.mode,
                additions: []
              } as AdditionsCategory)
              category = m.additions_category[0]
            }
            if (ad.mode === 'single' && category.additions.length > 0)
              throw new Error(`additions category ${ad.idCategoryId} is single`)

            category.additions.push({
              id: ad.id,
              cost: ad.cost,
              count: m.qty
            } as unknown as Additions)
          }
        }
      }
    }
    const order = new Orders(menu, user)
    order.comment = data.comment
    await order.save()
    const payment = await YokassaAPI.createPaymentOrder(order.total, order.id, 'Your order')
    order.payment_id = payment.payment_id
    await order.save()
    delete order.payment_id
    return {
      ...order,
      confirmation_token: payment.confirmation_token
    }
  }

  static async delete(id: number) {
    await Orders.delete({ id })
    return 'ok'
  }

}
