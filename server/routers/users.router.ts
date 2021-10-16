import express from 'express';
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import { Actions, Resources } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware';
import UserService from '../services/users.services';
import HttpError from '../lib/httpError';

const router = express.Router();

router.get('/', //TO DO new format response with pages and meta
  [
    allow(Resources.users, Actions.read),
    cache(600)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const users = await UserService.read(req.context?.condition)
      res.status(200).json(users);
    } catch (error) {
      console.log(error)
      res.status(500).end();
    }
  });


router.get('/profile',
  [
    allow(Resources.users, Actions.read), //cache(600)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserService.read({ key: 'id', value: [req.context.user.id] })
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
      await UserService.create(req.body.login, req.body.password)
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
      if (req.context.isAll || req.context.condition.value.includes(Number(req.params.id))) {
        const user = await UserService.update(Number(req.params['id']), req.body)
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
      await UserService.delete(user_id)
      res.json({
        result: 'ok'
      })
    } catch (error) {
      console.log(error)
      if (error instanceof HttpError)
        res.status(error.status).json({
          error: 'error',
          mesage: error.message
        });
    }
  })

export default router