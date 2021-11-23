import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import { Resources, Actions } from '../lib/permissionsBuilder';
import MenuService from '../services/menu.service';
import HttpErrorHandler from '../lib/httpErrorHandler';

const router = express.Router();

import additionsCategoryRouter from './additionsCategory.router'
import additionsRouter from './additions.router'
import categoryRouter from './menuCategory.router'
import MenuRecipes from './menuRecipes.router'
import MenuIngredients from './menuIngredients.router'
import FindOptionsParser from '../lib/FindOptionsParser';

router.use('/additions/category', additionsCategoryRouter);
router.use('/additions', additionsRouter);
router.use('/category', categoryRouter);
router.use('/', MenuRecipes)
router.use('/', MenuIngredients)

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req)
            res.json(await MenuService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.get('/:id',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req, { id: Number(req.params.id) })
            res.json(await MenuService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });


router.get('/:id/additions/category',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req, { id: Number(req.params.id) }, ['additions_category'])
            res.json(await MenuService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/',
    [
        body({ id_category: String, name: String, cost: String, description: String }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const data = { ...req.body, icon: req.files?.icon }
            const item = await MenuService.create(data)
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
            const data = { ...req.body, icon: req.files?.icon }
            const item = await MenuService.update(Number(req.params.id), data)
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
            await MenuService.delete(Number(req.params.id))
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;