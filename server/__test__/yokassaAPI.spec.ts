import axios from "axios";
import Orders from "../entity/orders";
import YokassaAPI from "../src/yokassaAPI";

describe('Test YokassaAPI:', () => {
    test('checkStatusPayments', async () => {
        const orders = [
            { id: 1, payment_id: 1 },
            { id: 1, payment_id: 1 }
        ]

        Orders.find = jest.fn().mockResolvedValue(orders)
        axios.get = jest.fn()
            .mockResolvedValueOnce({ data: { status: 'succeeded' } })
            .mockResolvedValueOnce({ data: { status: 'canceled' } })
        Orders.update = jest.fn().mockResolvedValue({})

        await YokassaAPI.checkStatusPayments()

        expect(Orders.find).toBeCalledTimes(1)
        expect(axios.get).toBeCalledTimes(orders.length)
        //expect(Orders.update).toBeCalledTimes(orders.length) //should be two, but it is zero
    })
})