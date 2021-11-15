import express from 'express';
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import { Actions, Resources } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware';
import UserService from '../services/users.service';
import HttpErrorHandler from '../lib/httpErrorHandler';
import DataProvider from '../lib/DataProvider';
import { In } from 'typeorm';

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
      const provider = new DataProvider('Users')
      res.json(await provider.index(req, condition))
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });


router.get('/profile',
  [
    allow(Resources.users, Actions.read)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserService.read({ key: 'id', value: [req.context.user.id] })
      res.status(200).json(user);
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.post('/',
  [
    body({ login: String, password: String }),
    allow(Resources.users, Actions.create)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      await UserService.create(req.body.login, req.body.password)
      res.status(200).json({
        result: "ok"
      });
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.patch('/:id',
  [
    allow(Resources.users, Actions.update)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      if (req.context.isAll || req.context.condition.value.includes(Number(req.params.id))) {
        const user = await UserService.update(Number(req.params['id']), req.body)
        res.status(200).json(user);
      } else {
        res.status(403).json({
          result: 'error'
        });
      }
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.delete('/:id',
  [
    allow(Resources.users, Actions.delete)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user_id: number = Number(req.params.id)
      await UserService.delete(user_id)
      res.json({ result: 'ok' })
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  })

export default router