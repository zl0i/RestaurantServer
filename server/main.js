const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const yookassa = require('./src/yokassaAPI');

const dbUser = process.env.MONGODB_USER || '';
const dbPassword = process.env.MONGODB_PASSWORD || '';
const dbUrl = process.env.MONGODB_HOST || 'db';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', true);
mongoose.Promise = Promise;

const app = express();
if (process.env.NODE_ENV !== 'test') {
  app.set('port', 3000);
  app.use(morgan(':date[iso] :remote-addr :method :url :status :response-time ms'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/restaurant/api/users', require('./routers/userRouter'));
app.use('/restaurant/api/orders', require('./routers/orderRouter'));
app.use('/restaurant/api/shops', require('./routers/shopRouter'));
app.use('/restaurant/api/address', require('./routers/addressRouter'));

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(`mongodb://${dbUser}:${dbPassword}@${dbUrl}:27017/restaurant?authSource=admin`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('[OK] DB is connected');
    })
    .catch((err) => {
      console.error('MongoDB is not connected');
      console.error(err.message);

      process.exit(1);
    });
}

const server = app.listen(app.get('port'), () => {
  console.log(`[OK] Server is running on ${app.get('port')} port`);
  yookassa.startCheckStatusPayments();
});

module.exports = { app, server };
