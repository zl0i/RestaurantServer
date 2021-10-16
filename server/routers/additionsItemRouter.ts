import express from 'express';
import allow from '../middleware/permissionVaildator'
import { body } from '../middleware/schemaChecker';
import { cache } from '../middleware/cacheMiddleware';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';
import AdditionsItem from '../entity/additions';
import Additions from '../entity/additions_category';

const router = express.Router();

router.get('/',
    [
        cache(180)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const provider = new DataProvider('AdditionsItem')
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
        body({ name: String, cost: Number, id_additions: Number }),
        allow(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const addition = await Additions.findOne({ id: req.body.id_additions })
            if (addition) {
                const item = new AdditionsItem()
                item.name = req.body.name
                item.cost = req.body.cost
                item.id_additions = addition
                await item.save()
                res.json(item)
            } else {
                res.status(400).json({
                    result: 'error',
                    message: "Добавка не найдена"
                })
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e.message
            })
        }
    })

router.patch('/:id',
    [
        allow(Resources.menu, Actions.update)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await AdditionsItem.findOne({ id: Number(req.params.id) })
            item.name = req.body.name || item.name
            item.cost = req.body.cost || item.cost
            if (req.body.id_additions) {
                const addition = await Additions.findOne({ id: req.body.id_additions })
                if (addition) {
                    item.id_additions = addition
                } else {
                    res.status(400).json({
                        result: 'error',
                        message: "Добавка не найдена"
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
            await AdditionsItem.delete({ id: Number(req.params.id) })
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