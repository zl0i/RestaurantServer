import express from 'express';
import { In } from 'typeorm';
import Menu from '../entity/menu';
import Points from '../entity/points';

const router = express.Router();

router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    const arr: Array<any> = new Array();
    const shops = await Points.find()
    const menu = await Menu.find({ id_point: In(shops.map(s => s.id)) })
    shops.forEach(s => {
      arr.push({
        ...s,
        menu: menu.filter(m => m.id_point === s.id)
      })
    })
    res.json(arr)
  } catch (error) {
    console.log(error)
    res.status(500).end();
  }
});

export default router;
