const mongoose = require('mongoose');
const yookassa = require('./src/yokassaAPI');
const { app } = require('./server')

const dbUser = process.env.APP_MONGODB_USER || '';
const dbPassword = process.env.APP_MONGODB_PASSWORD || '';
const dbUrl = 'db';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', true);
mongoose.Promise = Promise;

mongoose.connect(`mongodb://${dbUser}:${dbPassword}@${dbUrl}:27017/restaurant?authSource=admin`, { useNewUrlParser: true, useUnifiedTopology: true, })
  .then(() => {
    console.log('[OK] DB is connected');
  })
  .catch((err) => {
    console.error('MongoDB is not connected');
    console.error(err.message);
    process.exit(1);
  });


app.listen(app.get('port'), () => {
  console.log(`[OK] Server is running on ${app.get('port')} port`);
  yookassa.startCheckStatusPayments();
});
