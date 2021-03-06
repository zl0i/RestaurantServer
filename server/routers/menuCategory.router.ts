import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import { Resources, Actions } from '../lib/permissionsBuilder';
import MenuCategoryService from '../services/menuCategory.service';
import HttpErrorHandler from '../lib/httpErrorHandler';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/',
    [
        cache(600)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req)
            res.json(await MenuCategoryService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/',
    [
        body({ name: String, description: String, id_point: String }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const data = { ...req.body, icon: req.files?.icon }
            const category = await MenuCategoryService.create(data)
            res.json(category)
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
            const data = { ...req.body, icon: req.files?.icon }
            const category = await MenuCategoryService.update(Number(req.params.id), data)
            res.json(category)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    }
)

router.delete('/:id',
    [
        allow(Resources.menu, Actions.delete, 'id')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await MenuCategoryService.delete(Number(req.params.id))
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;