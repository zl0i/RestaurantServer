conn = new Mongo()
db = conn.getDB("restaurant")

db.createCollection("clients")

db.clients.insertMany([
    {
        _id: new ObjectId("607c02ab590df4349e468a0e"),
        name: "Dima",
        phone: "+79999999994",
        address: { street: "Главная улица", house: "1б", flat: "1" },
        orders: [],
        jwt_token: "86aa8e30-2e12-49fd-ba96-4c62d04e51b2",
        createToken: "2021-04-18T11:37:44.904Z"
    },
    {
        _id: new ObjectId("607c02ab590df4349e468a0f"),
        name: "Dima",
        phone: "+79999999993",
        address: { street: "Главная улица", house: "2В", flat: "18" },
        orders: [
            {
                id: 1,
                cost: 1500,
                datetime: "2021-04-18T11:37:44.904Z",
                status: "success"
            }
        ],
        jwt_token: "86aa8e30-2e12-49fd-ba96-4c62d04e51b8",
        createToken: "2021-04-18T11:37:44.904Z"
    },
    {
        _id: new ObjectId("607c1a063ba9f0e13730b0cd"),
        phone: "+79999999999",
        smsCode: "",
        address: { street: "Неглавная улица", house: "2В", flat: "20" },
        orders: [],
        createToken: "2021-04-18T11:37:44.904Z",
        orders: [],
        jwt_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2MxYTA2M2JhOWYwZTEzNzMwYjBjZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjI3NzE0MTE1fQ.pPNoO_bTOV5rvASJM2mTefvB91UWIMyGpm11vtOhsYM"
    }
])

db.createCollection('activeorders')

db.activeorders.insertMany([
    {
        _id: new ObjectId("607c1db2757534002588233c"),
        address: {
            flat: "20",
            house: "2В",
            street: "Неглавная улица"
        },
        datetime:  "2021-04-18T11:53:22.338Z",
        menu: [{
            _id: new ObjectId("607c1db2757534002588233d"),
            count: 3,
            id: 1
        }],
        user_id: "607c1a063ba9f0e13730b0cd",
        id: "d31502f1-7133-496d-a474-741e845666db",
        items_cost: 600,
        delivery_cost: 100,
        total: 700,
        shop_id: new ObjectId("607c02ab590df4349e468a11"),
        phone: "+79999999999",
        comment: "тест",
        status: "wait_payment",
        payment_id: "280e317c-000f-5000-8000-1b052129a7a6",
    },
    {
        _id: new ObjectId("607c1db2757534002588233d"),
        address: {
            flat: "20",
            house: "2В",
            street: "Неглавная улица"
        },
        datetime:  "2021-04-18T11:53:22.338Z",
        menu: [{
            _id: new ObjectId("607c1db2757534002588233d"),
            count: 3,
            id: 1
        }],
        user_id: "607c1a063ba9f0e13730b0cd",
        id: "d31502f1-7133-496d-a474-741e845666db",
        items_cost: 600,
        delivery_cost: 100,
        total: 700,
        shop_id: new ObjectId("607c02ab590df4349e468a11"),
        phone: "+79999999999",
        comment: "тест",
        status: "accepted",
        payment_id: "280e317c-000f-5000-8000-1b052129a7a6",
    }
])


db.createCollection("addresses")

db.addresses.insertMany([
    {
        _id: new ObjectId("607c02ab590df4349e468a10"),
        city: "Москва",
        streets: [
            {
                name: "Главная улица",
                houses: [
                    "1Б",
                    "2В"
                ]
            },
            {
                name: "Неглавная улица",
                houses: [
                    "1А",
                    "2В"
                ]
            }
        ]
    }
])

db.createCollection("shops")

db.shops.insertMany([
    {
        _id: new ObjectId("607c02ab590df4349e468a11"),
        name: "Тестовое кафе 1",
        address: "Москва, Главная улица 5",
        work_time: "пн-пт: 10:00-19:00, сб: 11:00-18:00, вс: выходной",
        status: "opened",
        delivery_status: "opened",
        min_cost_delivery: 500,
        delivery_city_cost: {
            "Москва": 100,
            "Воронеж": 700
        },
        items: {
            category: [
                "Первые блюда",
                "Гарниры",
                "Напитки"
            ],
            menu: [
                {
                    id: 1,
                    name: "Первое тестовое блюдо",
                    cost: 200,
                    description: "Какое то описание",
                    image: "test_one.jpg",
                    category_index: 0,
                    isEnd: false
                },
                {
                    id: 2,
                    name: "Тестовый гарнир",
                    cost: 150,
                    description: "Какое то описание в несколько строк для наглядности чтобы было и посмотреть как будет это отображаться в этом окошке",
                    image: "test_one.jpg",
                    category_index: 1,
                    isEnd: false
                },
                {
                    id: 3,
                    name: "Тестовый очень вкусный напиток, пить и пить)))",
                    cost: 190,
                    description: "Просто описание",
                    image: "test_one.jpg",
                    category_index: 2,
                    isEnd: false
                }
            ]
        }
    },
    {
        _id: new ObjectId("607c02ab590df4349e468a12"),
        name: "Тестовое кафе 2",
        address: "Москва, Неглавная улица 27",
        work_time: "пн-пт: 10:00-19:00, сб-вс: 11:00-18:00",
        status: "closed",
        delivery_status: "closed",
        min_cost_delivery: 500,
        delivery_city_cost: {
            "Москва": 100,
            "Воронеж": 700
        },
        items: {
            category: [
                "Разное"
            ],
            menu: [
                {
                    id: 4,
                    name: "Тестовое блюдо",
                    cost: 250,
                    category_index: 0,
                    isEnd: false
                }
            ]
        }
    }
])
