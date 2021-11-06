
import express from 'express'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'
import OrdersPayment, { OrderPaymentStatus } from '../entity/orders_payment';

const shipId = process.env.SHIP_ID || '54401';
const apikey = process.env.YOKASSA_APIKEY || 'test_Fh8hUAVVBGUGbjmlzba6TB0iyUbos_lueTHE-axOwM0';

export interface IPayment {
  confirmation_token: string
  payment_id: string
  idempotence_key: string
}

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

  static async createPaymentOrder(total: number, description: string): Promise<IPayment> {
    const idempotence_key = uuidv4()
    const reply = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotence_key
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
      }
    });

    return {
      confirmation_token: reply.data.confirmation.confirmation_token,
      payment_id: reply.data.id,
      idempotence_key: idempotence_key
    };
  }


  static async checkStatusPayments() {
    const orders = await OrdersPayment.find({ status: OrderPaymentStatus.wait });
    for(const order of orders) {
      try {
        const reply = await axios.get(`https://api.yookassa.ru/v3/payments/${order.payment_id}`, {
          auth: {
            username: shipId,
            password: apikey,
          }
        });
        switch (reply.data.status) {
          case 'succeeded':
            await OrdersPayment.update({ id_order: order.id_order }, { status: OrderPaymentStatus.paid });
            break;
          case 'canceled':
            await OrdersPayment.update({ id_order: order.id_order }, { status: OrderPaymentStatus.cancel });
            break;
        }
      } catch (e) {
        //console.log(e.message);
      }
    }    
  }

  static async handleHook(_req: express.Request, res: express.Response) {
    //check ip
    res.end()
  }
}




