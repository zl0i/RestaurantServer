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
            res.json(await provide.index(req, req.context.condition.findCondition))
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

router.post('/:id_warehouse/goods/:id_good/change',
    [
        allow(Resources.warehouses, Actions.update),
        body({ count: Number })
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const id_warehouse = Number(req.params.id_warehouse)
            const id_good = Number(req.params.id_good)
            const data = await WarehousesService.updateCountGood(id_warehouse, id_good, req.body)
            res.json(data)
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });

router.patch('/:id',
    [
        allow(Resources.warehouses, Actions.update, 'id')
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
        allow(Resources.warehouses, Actions.delete, 'id')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await WarehousesService.delete(Number(req.params.id))
            res.json({ result: 'ok' })
        } catch (error) {
            HttpErrorHandler.handle(error, res)
        }
    });


export default router;
