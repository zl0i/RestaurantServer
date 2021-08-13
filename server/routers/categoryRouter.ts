import express from 'express';
import scopeValidator from '../middleware/scopeVaildator'
import Menu from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import MenuCategory from '../entity/menu_category';

const router = express.Router();

router.get('/', [scopeValidator('menu:get')], async (req: express.Request, res: express.Response) => {
    try {
        if (req.query.id_point) {
            const menu = await MenuCategory.find({ id_point: Number(req.query.id_point) })
            res.json(menu)
        } else {
            const menu = await MenuCategory.find({})
            res.json(menu)
        }
    } catch (error) {
        console.log(error)
        res.status(500).end();
    }
});

router.post('/',
    [
        body({ name: String, icon: String, description: String, id_point: Number }),
        scopeValidator('menu:create')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const category = new MenuCategory()
            category.name = req.body.name
            category.icon = req.body.icon
            category.id_point = req.body.id_point
            category.description = req.body.description
            await category.save()
            res.json(category)
        } catch (e) {
            res.status(500).end()
        }
    }
)

router.patch('/:id',
    [
        body({ name: String, icon: String, description: String, id_point: Number }),
        scopeValidator('menu:update')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const category = await MenuCategory.findOne({ id: Number(req.params.id) })
            category.name = req.body.name
            category.icon = req.body.icon
            category.id_point = req.body.id_point
            category.description = req.body.description
            await category.save()
            res.json(category)
        } catch (e) {
            res.status(500).end()
        }
    }
)

router.delete('/:id', [scopeValidator('menu:delete')], async (req: express.Request, res: express.Response) => {
    try {
        const menu = await Menu.find({ id_category: Number(req.params.id) })
        if (menu.length > 0) {
            return res.status(400).json({
                result: 'error',
                message: 'Category isn\'t empty'
            })
        }

        await MenuCategory.delete({ id: Number(req.params.id) })
        res.json({
            result: 'ok'
        })

    } catch (e) {
        res.status(500).end()
    }
})

export default router;