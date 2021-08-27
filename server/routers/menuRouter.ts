import express from 'express';
import scopeValidator from '../middleware/scopeVaildator'
import Menu, { MenuStatus } from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import MenuCategory from '../entity/menu_category';
import { cache } from '../middleware/cacheMiddleware';
import ObjectStorage from '../src/storage'
import { UploadedFile } from 'express-fileupload';

const router = express.Router();

router.get('/', [scopeValidator('menu:get'), cache(1800)], async (req: express.Request, res: express.Response) => {
    try {
        if (req.query.id_point) {
            const menu = await Menu.find({ id_point: Number(req.query.id_point), status: MenuStatus.active })
            res.json(menu)
        } else {
            const menu = await Menu.find({ status: MenuStatus.active })
            res.json(menu)
        }
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
        scopeValidator('menu:create')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const category = await MenuCategory.findOne({ id: req.body.id_category })
            if (category) {
                const item = new Menu()
                if (!!req.files?.icon) {
                    item.icon = await ObjectStorage.uploadImage(req.files.icon as UploadedFile)
                }
                item.name = req.body.name
                item.cost = req.body.cost
                item.id_category = category.id
                item.id_point = category.id_point
                item.description = req.body.description
                await item.save()
                res.json(item)
            } else {
                res.status(400).json({
                    result: 'error',
                    message: "Категория не найдена"
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

//TO DO patch image
router.patch('/:id',
    [
        body({ id_category: Number, name: String, cost: Number, icon: String, description: String }),
        scopeValidator('menu:update')
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const category = await MenuCategory.findOne({ id: req.body.id_category })
            if (category) {
                const item = await Menu.findOne({ id: Number(req.params.id) })
                item.name = req.body.name
                item.cost = req.body.cost
                item.icon = req.body.icon
                item.id_category = category.id
                item.id_point = category.id_point
                item.description = req.body.description
                await item.save()
                res.json(item)
            } else {
                res.status(400).json({
                    result: 'error',
                    message: "Категория не найдена"
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

//TO DO delete image
router.delete('/:id', [scopeValidator('menu:delete')], async (req: express.Request, res: express.Response) => {
    try {
        await Menu.delete({ id: Number(req.params.id) })
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