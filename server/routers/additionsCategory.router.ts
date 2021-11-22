import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import { Resources, Actions } from '../lib/permissionsBuilder';
import AdditionsCategoryService from '../services/additionsCategory.service';
import HttpErrorHandler from '../lib/httpErrorHandler';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req)
            res.json(await AdditionsCategoryService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/',
    [
        body({ name: String, ids_menu: Array, mode: String }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await AdditionsCategoryService.create(req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    }
)

router.patch('/:id',
    [
        allow(Resources.menu, Actions.update, 'id')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await AdditionsCategoryService.update(Number(req.params.id), req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

router.delete('/:id',
    [
        allow(Resources.menu, Actions.delete, 'id')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await AdditionsCategoryService.delete(Number(req.params.id))
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;