import express from 'express';
import { Users } from '../entity/user';
import { body } from '../middleware/schemaChecker';
import scopeValidator from '../middleware/scopeVaildator'
import bcrypt from 'bcryptjs'
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware';
import { In } from 'typeorm';

const router = express.Router();

router.get('/', [scopeValidator('users:get'), cache(600)], async (req: express.Request, res: express.Response) => {
  try {
    const condition: object = {}
    if (req.context?.condition.value.length > 0) {
      condition[req.context?.condition?.key] = In(req.context?.condition.value)
    }
    res.status(200).json(await Users.find(condition));
  } catch (error) {
    console.log(error)
    res.status(500).end();
  }
});

router.post('/', [body({ login: String, password: String }), scopeValidator('users:create')], async (req: express.Request, res: express.Response) => {
  try {
    const user = new Users()
    user.login = req.body.login
    user.password = bcrypt.hashSync(req.body.password, 5)
    await user.save()
    PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.admin)

    res.status(200).json({
      result: "ok"
    });
  } catch (error) {
    console.log(error)
    res.status(500).end();
  }
});

export default router