import express from 'express';
import { Users } from '../entity/user';
import { body } from '../middleware/schemaChecker';
import scopeValidator from '../middleware/scopeVaildator'
import bcrypt from 'bcryptjs'
import PermissionsBuilder, { UserRoles } from '../lib/permissionsBuilder';

const router = express.Router();

router.get('/', [body({ token: String }), scopeValidator('users:get')], async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.context?.condition)
    res.status(200).json(await Users.find(req.context?.condition));
  } catch (error) {
    console.log(error)
    res.status(500).end();
  }
});

router.post('/', [body({ login: String, password: String }), scopeValidator('users:create')], async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.context?.condition)
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