import express from 'express';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import HttpErrorHandler from '../lib/httpErrorHandler';
import { Resources, Actions } from '../lib/permissionsBuilder';
import allow from '../middleware/permissionVaildator';
import AdditionsIngredientsService from '../services/additionsIngredients.service';

const router = express.Router();

router.get('/:id/ingredients/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('AdditionsIngredients')
            res.json(await provider.index(req, { id_addition: Number(req.params.id) }))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_add/ingredients/',
    [
        allow(Resources.menu, Actions.create, 'id_add')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            const item = await AdditionsIngredientsService.create(id_add, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_add/ingredients/append',
    [
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            const item = await AdditionsIngredientsService.create(id_add, req.body, true)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.patch('/:id_add/ingredients/:id_ingr',
    [
        allow(Resources.menu, Actions.update)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            const id_ingr = Number(req.params.id_ingr)
            const item = await AdditionsIngredientsService.update(id_add, id_ingr, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.delete('/:id_add/ingredients/:id_ingr',
    [
        allow(Resources.menu, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            const id_ingr = Number(req.params.id_ingr)
            await AdditionsIngredientsService.delete(id_add, id_ingr)
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;