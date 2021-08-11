
import "reflect-metadata";
import app from './server';
import * as db from "typeorm";
import YookassaAPI from './src/yokassaAPI';

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
    "./entity/*.ts"
  ],
}).then(async (connection) => {
  console.log('[OK] DB is connected');
  await connection.synchronize();
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
