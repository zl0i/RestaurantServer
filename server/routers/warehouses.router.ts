import express from 'express';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import { cache } from '../middleware/cacheMiddleware'
import { body } from '../middleware/schemaChecker';
import allow from '../middleware/permissionVaildator'
import HttpErrorHandler from '../lib/httpErrorHandler';
import WarehousesService from '../services/warehouses.service';

const router = express.Router();


router.get('/',
    [
        allow(Resources.warehouses, Actions.read),
        cache(20),
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provide = new DataProvider('Warehouses')
            res.json(await provide.index(req))
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.post('/',
    [
        allow(Resources.warehouses, Actions.create),
        body({ name: String, address: String, ids_points: Array })
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const warehouse = await WarehousesService.create(req.body)
            res.json(warehouse)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.patch('/:id',
    [
        allow(Resources.warehouses, Actions.update)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const warehouse = await WarehousesService.update(Number(req.params.id), req.body)
            res.json(warehouse)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.delete('/:id',
    [
        allow(Resources.warehouses, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await WarehousesService.delete(Number(req.params.id))
            res.json({
                result: 'ok'
            })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });


export default router;
