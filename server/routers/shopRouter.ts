import express from 'express';
import { In } from 'typeorm';
import Menu from '../entity/menu';
import MenuCategory from '../entity/menu_category';
import Points from '../entity/points';
import { cache } from '../middleware/cacheMiddleware'

const router = express.Router();

router.get('/', [cache(3600)], async (_req: express.Request, res: express.Response) => {
  try {
    const arr: Array<any> = new Array();
    const shops = await Points.find()
    const menu = await Menu.find({ id_point: In(shops.map(s => s.id)) })

    for (const s of shops) {
      const category = await MenuCategory.find({ id_point: s.id })
      arr.push({
        ...s,
        category,
        menu: menu.filter(m => m.id_point === s.id)
      })
    }
    res.json(arr)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: e.message
    })
  }
});

export default router;
