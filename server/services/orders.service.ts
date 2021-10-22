import Points from '../entity/points'
import Orders, { OrderStatus } from '../entity/orders';
import { Users } from '../entity/user';
import YokassaAPI from '../src/yokassaAPI';
import OrderContent from '../entity/order_content';
import Menu from '../entity/menu';
import OrderDelivery from '../entity/order_delivery';


export interface IAddress {
  city: string,
  street: string,
  houde: string,
  flat: string
}

export interface IContentOrder {
  id: number
  count: number
}

export interface UserOrder {
  order_id: number,
  payment_token: string
}

export default class OrderBuilder {

  private _address: IAddress;
  private _menu: Array<IContentOrder>
  private _comment: string
  private _phone: string
  private _id_point: number
  private _user: Users

  constructor(user: Users, menu: Array<IContentOrder>, id_point: number) {
    this._user = user
    this._menu = menu
    this._id_point = id_point
  }

  address(address: IAddress): OrderBuilder {
    this._address = address
    return this
  }

  comment(text: string) {
    this._comment = text
    return this
  }

  phone(phone: string) {
    this._phone = phone
    return this
  }

  async build(): Promise<UserOrder> {
    const point = await Points.findOne({ id: this._id_point })

    const order = new Orders();
    order.id_point = point.id
    order.id_user = this._user.id
    order.date = new Date();
    order.status = OrderStatus.accepted;
    order.phone = this._phone
    order.comment = this._comment
    await order.save();

    let cost = 0;

    this._menu.forEach(async (el: IContentOrder) => {
      const item = await Menu.findOne({ id: el.id })

      const content = new OrderContent()
      content.id_menu = el.id
      content.id_order = order.id
      content.count = el.count
      content.cost = item.cost
      await content.save()
      cost += item.cost * el.count
    }, 0)

    if (this._address) {
      const delivery = new OrderDelivery()
      delivery.id_order = order.id
      delivery.address = JSON.stringify(this._address)
      delivery.cost = point.delivery_cost
      await delivery.save()
    }

    const payment = await YokassaAPI.createPaymentOrder(cost, order.id, 'Заказ')
    order.total = cost
    order.status = OrderStatus.wait_payment;
    order.payment_id = payment.payment_id
    await order.save()

    return {
      order_id: order.id,
      payment_token: payment.confirmation_token
    };
  }
}
