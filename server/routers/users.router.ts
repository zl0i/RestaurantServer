import express from 'express';
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import { Actions, Resources } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware';
import UserService from '../services/users.service';
import HttpErrorHandler from '../lib/httpErrorHandler';
import FindOptionsParser from '../lib/FindOptionsParser';


const router = express.Router();

router.get('/',
  [
    allow(Resources.users, Actions.read),
    cache(600)
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const options = FindOptionsParser.parse(req)
      res.json(await UserService.read(options))
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
      const options = FindOptionsParser.parse(req, { id: req.context.user.id })
      res.json(await UserService.read(options))
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.post('/',
  [
    allow(Resources.users, Actions.create),
    body({ login: String, password: String, permissions: Array })
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserService.create(req.context.user, req.body)
      res.json(user);
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.patch('/:id',
  [
    allow(Resources.users, Actions.update, 'id')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserService.update(Number(req.params['id']), req.body)
      res.json(user);
    } catch (error) {
      HttpErrorHandler.handle(error, res)
    }
  });

router.delete('/:id',
  [
    allow(Resources.users, Actions.delete, 'id')
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