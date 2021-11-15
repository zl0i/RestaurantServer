import axios from "axios";
import OrdersPayment from "../entity/orders_payment.entity";
import YokassaAPI from "../src/yokassaAPI";

describe('Test YokassaAPI:', () => {
    test('checkStatusPayments', async () => {
        const orders = [
            { id: 1, payment_id: 1 },
            { id: 1, payment_id: 1 }
        ]

        OrdersPayment.find = jest.fn().mockResolvedValue(orders)
        axios.get = jest.fn()
            .mockResolvedValueOnce({ data: { status: 'succeeded' } })
            .mockResolvedValueOnce({ data: { status: 'canceled' } })
        OrdersPayment.update = jest.fn().mockResolvedValue({})

        await YokassaAPI.checkStatusPayments()

        expect(OrdersPayment.find).toBeCalledTimes(1)
        expect(axios.get).toBeCalledTimes(orders.length)
        expect(OrdersPayment.update).toBeCalledTimes(orders.length)
    })
})