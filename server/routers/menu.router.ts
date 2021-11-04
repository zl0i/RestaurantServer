import express from 'express';
import allow from '../middleware/permissionVaildator'
import { MenuStatus } from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import MenuService from '../services/menu.service';
import HttpErrorHandler from '../lib/httpErrorHandler';

const router = express.Router();

import MenuRecipes from './menuRecipes.router'
import MenuIngredients from './menuIngredients.router'

router.use('/', MenuRecipes)
router.use('/', MenuIngredients)

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('Menu')
            res.json(await provider.index(req, { status: MenuStatus.active }))
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
            const provider = new DataProvider('Menu')
            res.json(await provider.index(req, { id: Number(req.params.id) }))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });


router.get('/:id/additions',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('AdditionsCategory')
            res.json(await provider.index(req, { id_menu: Number(req.params.id) }, ['additions']))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.get('/:id/recipe',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('MenuRecipes')
            res.json(await provider.index(req, { id_menu: Number(req.params.id) }))
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
        allow(Resources.menu, Actions.update)
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
        allow(Resources.menu, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await MenuService.delete(Number(req.params.id))
            res.json({
                result: 'ok'
            })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;