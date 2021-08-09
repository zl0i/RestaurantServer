
import express from 'express'
import axios from 'axios';
import Orders, { OrderStatus } from '../entity/orders';

const shipId = process.env.SHIP_ID || '54401';
const apikey = process.env.YOKASSA_APIKEY || 'test_Fh8hUAVVBGUGbjmlzba6TB0iyUbos_lueTHE-axOwM0';

export default class YokassaAPI {

  private isStart: boolean = false
  private timer: NodeJS.Timer

  startCheckStatusPayments(minutes?: number) {
    if (this.isStart)
      return;

    this.isStart = true
    let interval = minutes * 60 * 1000 || 60000;
    this.timer = setInterval(YokassaAPI.checkStatusPayments, interval);
  }

  stopCheckStatusPayments() {
    this.isStart = false
    clearInterval(this.timer);
  }

  static async createPaymentOrder(total: number, order_id: number, description: string) {
    const reply = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': order_id,
      },
      auth: {
        username: shipId,
        password: apikey,
      },
      data: {
        amount: {
          value: String(Number(total).toFixed(2)),
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        capture: true,
        description: description,
      },
    });

    return {
      token: reply.data.confirmation.confirmation_token,
      payment_id: reply.data.id,
    };
  }


  static async checkStatusPayments() {
    const orders = await Orders.find({ status: OrderStatus.wait_payment });
    orders.forEach(async (order) => {
      try {
        const reply = await axios.get(`https://api.yookassa.ru/v3/payments/${order.payment_id}`, {
          auth: {
            username: shipId,
            password: apikey,
          }
        }); 
        switch (reply.data.status) {
          case 'succeeded':
            await Orders.update({ id: order.id }, { status: OrderStatus.paymented });
            break;
          case 'canceled':
            await Orders.update({ id: order.id }, { status: OrderStatus.cancel_payment });
            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  static async handleHook(_req: express.Request, res: express.Response) {
    //check ip
    res.end()
  }
}




