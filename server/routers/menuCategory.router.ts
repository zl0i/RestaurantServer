import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import MenuCategoryService from '../services/menuCategory.service';
import HttpError from '../lib/httpError';

const router = express.Router();

router.get('/',
    [
        cache(600)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('MenuCategory')
            res.json(await provider.index(req))
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    });

router.post('/',
    [
        body({ name: String, description: String, id_point: String }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const data = { ...req.body, icon: req.files?.icon }
            const category = await MenuCategoryService.create(data)
            res.json(category)
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
            const category = await MenuCategoryService.update(Number(req.params.id), data)
            res.json(category)
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

router.delete('/:id',
    [
        allow(Resources.menu, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await MenuCategoryService.delete(Number(req.params.id))
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