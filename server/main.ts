
//import yookassa from './src/yokassaAPI';
import app from './server';
import "reflect-metadata";
import * as db from "typeorm";

const dbUser: string = process.env['APP_MONGODB_USER'] || 'root';
const dbPassword: string = process.env['APP_MONGODB_PASSWORD'] || 'admin';

db.createConnection({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: dbUser,
  password: dbPassword,
  database: "restaurant",
  entities: [
    "./entity/**/*.ts"
  ],
}).then(() => {
  console.log('[OK] DB is connected');
}).catch((err) => {
  console.error('MongoDB is not connected');
  console.error(err.message);
  process.exit(1);
})


app.listen(app.get('port'), () => {
  console.log(`[OK] Server is running on ${app.get('port')} port`);
  //yookassa.startCheckStatusPayments();
});
