
import "reflect-metadata";
import app from './server';
import * as db from "typeorm";
import YookassaAPI from './src/yokassaAPI';

const db_host: string = process.env['DB_HOST'] || 'localhost'
const db_password: string = process.env['DB_PASSWORD'] || 'admin';
const db_name: string = process.env['DB_NAME'] || 'restaurant'

db.createConnection({
  type: "mysql",
  host: db_host,
  port: 3306,
  username: 'root',
  password: db_password,
  database: db_name,
  entities: [
    "./entity/*[.ts|.js]"
  ],
  synchronize: true
}).then(() => {
  console.log('[OK] DB is connected');
}).catch((err) => {
  console.error('[ERROR] DB isn\'t connected');
  console.error(err.message);
  process.exit(1);
})

const yookassaApi = new YookassaAPI()

app.listen(app.get('port'), () => {
  console.log(`[OK] Server is running on ${app.get('port')} port`);
  yookassaApi.startCheckStatusPayments()
});
