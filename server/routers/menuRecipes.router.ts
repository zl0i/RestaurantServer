import express from 'express';
import { cache } from '../middleware/cacheMiddleware';
import HttpErrorHandler from '../lib/httpErrorHandler';
import { Resources, Actions } from '../lib/permissionsBuilder';
import allow from '../middleware/permissionVaildator';
import MenuRecipeService from '../services/menuRecipe.service';
import FindOptionsParser from '../lib/FindOptionsParser';

const router = express.Router();

router.get('/:id_menu/recipe/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req, { id_menu: Number(req.params.id_menu) })
            res.json(await MenuRecipeService.read(options))            
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/:id_menu/recipe/',
    [
        allow(Resources.menu, Actions.update, 'id_menu')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            const item = await MenuRecipeService.create(id_menu, req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.delete('/:id_menu/recipe',
    [
        allow(Resources.menu, Actions.delete, 'id_menu')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_menu = Number(req.params.id_menu)
            await MenuRecipeService.delete(id_menu)
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;