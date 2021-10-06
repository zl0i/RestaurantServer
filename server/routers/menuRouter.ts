import express from 'express';
import scopeValidator from '../middleware/scopeVaildator'
import Menu, { MenuStatus } from '../entity/menu';
import { body } from '../middleware/schemaChecker';
import MenuCategory from '../entity/menu_category';
import { cache } from '../middleware/cacheMiddleware';
import ObjectStorage from '../src/storage'
import { UploadedFile } from 'express-fileupload';
import DataProvider from '../lib/DataProvider';
import { Resources, Actions } from '../lib/permissionsBuilder';

const router = express.Router();

router.get('/', [cache(180)], async (req: express.Request, res: express.Response) => {
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

router.get('/:id', [cache(180)], async (req: express.Request, res: express.Response) => {
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


router.get('/:id/additions', [/*cache(180)*/], async (req: express.Request, res: express.Response) => {
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
        scopeValidator(Resources.menu, Actions.create)
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const category = await MenuCategory.findOne({ id: req.body.id_category })
            if (category) {
                const item = new Menu()
                item.name = req.body.name
                item.cost = Number(req.body.cost)
                item.id_category = category.id
                item.id_point = category.id_point
                item.description = req.body.description
                await item.save()
                if (!!req.files?.icon) {
                    const file = req.files.icon as UploadedFile
                    item.icon = await ObjectStorage.uploadImage(file as UploadedFile, item.id) as string
                    await item.save()
                }
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

router.patch('/:id',
    [scopeValidator(Resources.menu, Actions.update)],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await Menu.findOne({ id: Number(req.params.id) })
            item.name = req.body.name || item.name
            item.cost = Number(req.body.cost) || item.cost
            item.description = req.body.description || item.description
            if (req.body.id_category) {
                const category = await MenuCategory.findOne({ id: req.body.id_category })
                if (category) {
                    item.id_category = category.id
                } else {
                    res.status(400).json({
                        result: 'error',
                        message: 'Категория не найдена'
                    })
                    return
                }
            }
            if (!!req.files?.icon) {
                const file = req.files.icon as UploadedFile
                item.icon = await ObjectStorage.replaceImage(item.icon, file, item.id) as string
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
    [scopeValidator(Resources.menu, Actions.delete)],
    async (req: express.Request, res: express.Response) => {
        try {
            const item = await Menu.findOne({ id: Number(req.params.id) })
            await ObjectStorage.deleteImage(item.icon)
            await item.remove()
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