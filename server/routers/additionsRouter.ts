import express from 'express';
import allow from '../middleware/permissionVaildator'
import Menu from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import Additions from '../entity/additions';

const router = express.Router();

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('Additions')
            await provider.index(req, res)
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    });

router.post('/',
    [
        body({ name: String, id_menu: Number, mode: String }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const menu = await Menu.findOne({ id: req.body.id_menu })
            if (menu) {
                const item = new Additions()
                item.name = req.body.name
                item.id_menu = menu
                item.mode = req.body.mode
                await item.save()
                res.json(item)
            } else {
                res.status(400).json({
                    result: 'error',
                    message: "Блюдо не найдена"
                })
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    }
)

router.patch('/:id',
    [
        allow(Resources.menu, Actions.update)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await Additions.findOne({ id: Number(req.params.id) })
            item.name = req.body.name || item.name
            item.mode = req.body.mode || item.mode
            if (req.body.id_menu) {
                const menu = await Menu.findOne({ id: req.body.id_menu })
                if (menu) {
                    item.id_menu = menu
                } else {
                    return res.status(400).json({
                        result: 'error',
                        message: 'Категория не найдена'
                    })
                }
            }
            await item.save()
            res.json(item)
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    })

router.delete('/:id',
    [
        allow(Resources.menu, Actions.delete)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            await Additions.delete({ id: Number(req.params.id) })
            res.json({
                result: 'ok'
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    })

export default router;