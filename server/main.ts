
import "reflect-metadata";
import app from './server';
import * as db from "typeorm";
import YookassaAPI from './src/yokassaAPI';
import { Users } from "./entity/user";
import PermissionsBuilder, { UserRoles } from "./lib/permissionsBuilder";

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
}).then(async () => {
  console.log('[OK] DB is connected');

  const admin = await Users.findOne({ login: 'admin'})
  if(!admin) {
    admin.password = '$2a$05$njMr04iy.MTsL/aG49i8/e5dxzsdKf3I1IgBWEkoVAsPrS3VZwd5m'
    await admin.save()
  } 
  PermissionsBuilder.setUserRolePermissions(admin.id, UserRoles.admin)
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
