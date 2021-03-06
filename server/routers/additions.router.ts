import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import { Resources, Actions } from '../lib/permissionsBuilder';
import AdditionsService from '../services/additions.service';
import HttpErrorHandler from '../lib/httpErrorHandler';

const router = express.Router();


import AdditionRecipes from './additionsRecipes.router'
import AdditionsIngredients from './additionIngredients.router'
import FindOptionsParser from '../lib/FindOptionsParser';

router.use('/', AdditionRecipes)
router.use('/', AdditionsIngredients)

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const options = FindOptionsParser.parse(req)
            res.json(await AdditionsService.read(options))
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
            res.json(await AdditionsService.read(options))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/',
    [
        body({ name: String, cost: Number, id_additions: Number }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await AdditionsService.create(req.body)
            res.json(item)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

router.patch('/:id',
    [
        allow(Resources.menu, Actions.update, 'id')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await AdditionsService.update(Number(req.params.id), req.body)
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
            await AdditionsService.delete(Number(req.params.id))
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    })

export default router;