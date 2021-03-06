import express from 'express';
import { cache } from '../middleware/cacheMiddleware';
import HttpErrorHandler from '../lib/httpErrorHandler';
import MenuIngredientsService from '../services/menuIngredients.service';
import { Resources, Actions } from '../lib/permissionsBuilder';
import allow from '../middleware/permissionVaildator';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/:id/ingredients/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req, { id_menu: Number(req.params.id_menu) })
            res.json(await MenuIngredientsService.read(options))  
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_menu/ingredients/',
    [
        allow(Resources.menu, Actions.create, 'id_menu')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            const item = await MenuIngredientsService.create(id_menu, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_menu/ingredients/append',
    [
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            const item = await MenuIngredientsService.create(id_menu, req.body, true)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.patch('/:id_menu/ingredients/:id_ingr',
    [
        allow(Resources.menu, Actions.update, 'id_menu')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            const id_ingr = Number(req.params.id_ingr)
            const item = await MenuIngredientsService.update(id_menu, id_ingr, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.delete('/:id_menu/ingredients/:id_ingr',
    [
        allow(Resources.menu, Actions.delete, 'id_menu')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            const id_ingr = Number(req.params.id_ingr)
            await MenuIngredientsService.delete(id_menu, id_ingr)
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;