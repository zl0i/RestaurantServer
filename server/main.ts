
import "reflect-metadata";
import app from './server';
import * as db from "typeorm";
import YookassaAPI from './src/yokassaAPI';
import { Users } from "./entity/user.entity";
import PermissionsBuilder, { UserRoles } from "./lib/permissionsBuilder";
import ObjectStorage from "./src/storage";
import { UsersInfo } from "./entity/users_info.entity";

const DB_HOST: string = process.env['DB_HOST'] || 'localhost'
const DB_USER = 'root'
const DB_PASSWORD: string = process.env['DB_PASSWORD'] || 'admin';
const DB_NAME: string = process.env['DB_NAME'] || 'restaurant'
const MINIO_HOST: string = process.env['STORAGE_HOST'] || 'minio'
const MINIO_ACCESS_KEY: string = process.env['STORAGE_USER']
const MINIO_SECRET_KEY: string = process.env['STORAGE_PASSWORD']

if (process.env['NODE_ENV'] == 'dev') {
  console.log('[WARNING] This app started in dev mode!')
}

ObjectStorage.connect({
  endPoint: MINIO_HOST,
  port: 9000,
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
})
  .then(_ => {
    console.log('[OK] Storage is connected')
  })
  .catch(e => {
    console.log('[ERROR] Storage is not connected')
    console.log(e.mesage)
  })

db.createConnection({
  type: "mysql",
  host: DB_HOST,
  port: 3306,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [
    "./entity/*[.ts]"
  ],
  migrations: [
    "./entity/migrations/*[.ts]"
  ],
  cli: {
    migrationsDir: "./entity/migrations/"
  },
  migrationsRun: true,
  synchronize: true
}).then(async () => {
  console.log('[OK] DB is connected');

  const admin = await UsersInfo.findOne({ login: 'admin' })
  if (!admin) {
    const newAdmin = new Users()
    newAdmin.info = new UsersInfo()
    newAdmin.info.login = 'admin'
    newAdmin.password = '$2a$05$njMr04iy.MTsL/aG49i8/e5dxzsdKf3I1IgBWEkoVAsPrS3VZwd5m'
    await newAdmin.save()
    await PermissionsBuilder.setUserRolePermissions(newAdmin.id, UserRoles.admin)
  } else {
    await PermissionsBuilder.setUserRolePermissions(admin.id, UserRoles.admin)
  }
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
