import express from 'express';
import { Users } from '../entity/user';
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import bcrypt from 'bcryptjs'
import PermissionsBuilder, { Actions, Resources, UserRoles } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware';
import { In } from 'typeorm';
import { Tokens } from '../entity/tokens';
import { token_permissions } from '../entity/token_permissions';
import { user_permissions } from '../entity/user_permissions';

const router = express.Router();

router.get('/',
  [
    allow(Resources.users, Actions.read),
    cache(600)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const condition: object = {}
      if (req.context?.condition.value.length > 0) {
        condition[req.context?.condition?.key] = In(req.context?.condition.value)
      }
      const users: any = await Users.find(condition)
      for (const user of users) {
        const permissions = await user_permissions.find({ id_user: user.id })
        user.permissions = new Array()
        user.removePrivateData()
        for (const perm of permissions) {
          user.permissions.push(`${perm.resource}:${perm.action}:${perm.scope}`)
        }
      }
      res.status(200).json(users);
    } catch (error) {
      console.log(error)
      res.status(500).end();
    }
  });


router.get('/profile',
  [
    allow(Resources.users, Actions.read), cache(600)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user: any = await Users.findOne({ id: req.context.user.id })
      const permissions = await user_permissions.find({ id_user: user.id })
      user.permissions = new Array()
      for (const perm of permissions) {
        user.permissions.push(`${perm.resource}:${perm.action}:${perm.scope}`)
      }
      user.removePrivateData()
      res.status(200).json(user);
    } catch (error) {
      console.log(error)
      res.status(500).end();
    }
  });

router.post('/',
  [
    body({ login: String, password: String }),
    allow(Resources.users, Actions.create)
  ],
  async (req: express.Request, res: express.Response) => {
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

router.patch('/:id',
  [
    allow(Resources.users, Actions.update)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      if (req.context.condition.value.includes(Number(req.params.id))) {
        const user = await Users.findOne({ id: Number(req.params.id) })
        user.name = req.body.name || user.name
        user.lastname = req.body.lastname || user.lastname
        user.login = req.body.login || user.login
        user.age = Number(req.body.age) || user.age
        user.birthday = new Date(req.body.birthday) || user.birthday
        await user.save()
        user.removePrivateData()
        res.status(200).json(user);
      } else {
        res.status(403).json({
          result: 'error'
        });
      }
    } catch (error) {
      console.log(error)
      res.status(500).end();
    }
  });

router.delete('/:id',
  [
    allow(Resources.users, Actions.delete)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user_id: number = Number(req.params.id)
      const user = await Users.findOne({ id: user_id })
      if (user) {
        await user.remove()
        await user_permissions.delete({ id_user: user_id })
        const token = await Tokens.findOne({ id_user: user_id })
        await token_permissions.delete({ id_token: token.id })
        await token.remove()
        res.json({
          result: 'ok'
        })
      } else {
        res.status(400).json({
          result: 'error',
          message: 'User not found'
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).end();
    }
  })

export default router