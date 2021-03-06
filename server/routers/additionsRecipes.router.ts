import express from 'express';
import { cache } from '../middleware/cacheMiddleware';
import HttpErrorHandler from '../lib/httpErrorHandler';
import { Resources, Actions } from '../lib/permissionsBuilder';
import allow from '../middleware/permissionVaildator';
import AdditionsRecipeService from '../services/additionsRecipe.service';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/:id_add/recipe/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req, { id_addition: Number(req.params.id_add) })
            res.json(await AdditionsRecipeService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_add/recipe/',
    [
        allow(Resources.menu, Actions.update, 'id_add')
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
        allow(Resources.menu, Actions.delete, 'id_add')
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