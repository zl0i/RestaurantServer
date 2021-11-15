import express from 'express';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import HttpErrorHandler from '../lib/httpErrorHandler';
import { Resources, Actions } from '../lib/permissionsBuilder';
import allow from '../middleware/permissionVaildator';
import AdditionsRecipeService from '../services/additionsRecipe.service';

const router = express.Router();

router.get('/:id_add/recipe/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('AdditionsRecipes')
            res.json(await provider.index(req, { id_addition: Number(req.params.id_add) }))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_add/recipe/',
    [
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            const item = await AdditionsRecipeService.create(id_add, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.delete('/:id_add/recipe',
    [
        allow(Resources.menu, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_add = Number(req.params.id_add)
            await AdditionsRecipeService.delete(id_add)
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;