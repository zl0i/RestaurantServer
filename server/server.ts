import express from 'express'
import fileUpload from 'express-fileupload'
import * as prom from './src/prometheus'
import morgan from 'morgan';
import authRouter from './routers/auth.router'
import usersRouter from './routers/users.router'
import orderRouter from './routers/order.router'
import oauthRouter from './routers/oauth.router'
import menuRouter from './routers/menu.router'
import imageRouter from './routers/imagesRouter'
import pointRouter from './routers/point.router'

const app = express();

app.set('port', 3000);
app.get('/metrics', prom.metricsRoute)
app.use(prom.middleware)
app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));

if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan(':date[iso] :remote-addr :method :url :status :response-time ms'));
}

app.use('/restaurant/images', imageRouter);
app.use('/restaurant/api/auth', authRouter);
app.use('/restaurant/api/oauth', oauthRouter);
app.use('/restaurant/api/users', usersRouter);
app.use('/restaurant/api/orders', orderRouter);
app.use('/restaurant/api/point', pointRouter);
app.use('/restaurant/api/menu', menuRouter);

if (process.env['NODE_ENV'] == 'test') {
    //It's magic!!! This need for the supertest.
    const server = app.listen(0, () => { })
    server.close()
}

export default app