const express = require('express');
const morgan = require('morgan');

const app = express();
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':date[iso] :remote-addr :method :url :status :response-time ms'));
}

app.set('port', 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/restaurant/api/clients', require('./routers/clientsRouter'));
app.use('/restaurant/api/orders', require('./routers/orderRouter'));
app.use('/restaurant/api/shops', require('./routers/shopRouter'));
app.use('/restaurant/api/address', require('./routers/addressRouter'));
app.use('/restaurant/api/oauth', require('./routers/oauthRouter'));

if (process.env.NODE_ENV == 'test') {
    //It's magic!!! This need for the supertest.
    const server = app.listen(0, () => { })
    server.close()
}

module.exports = {
    app
}
