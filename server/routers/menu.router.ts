import express from 'express';
import allow from '../middleware/permissionVaildator'
import { MenuStatus } from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import MenuService from '../services/menu.service';
import HttpError from '../lib/httpError';

const router = express.Router();

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('Menu')
            await provider.index(req, res, { status: MenuStatus.active })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    });

router.get('/:id',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('Menu')
            await provider.index(req, res, { id: Number(req.params.id) })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    });


router.get('/:id/additions',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('Additions')
            await provider.index(req, res, { id_menu: Number(req.params.id) })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
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
            console.log(error)
            if (error instanceof HttpError) {
                res.status(error.status).json({
                    error: 'error',
                    mesage: error.message
                });
            } else {
                res.status(500).json({
                    message: error.message
                })
            }
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
            console.log(error)
            if (error instanceof HttpError) {
                res.status(error.status).json({
                    error: 'error',
                    mesage: error.message
                });
            } else {
                res.status(500).json({
                    message: error.message
                })
            }
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
            console.log(error)
            if (error instanceof HttpError) {
                res.status(error.status).json({
                    error: 'error',
                    mesage: error.message
                });
            } else {
                res.status(500).json({
                    message: error.message
                })
            }
        }
    })

export default router;