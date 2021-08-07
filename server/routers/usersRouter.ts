import express from 'express';
import { Users } from '../entity/user';
import scopeValidator from '../middleware/scopeVaildator'

const router = express.Router();

router.get('/', [scopeValidator('users:get')], async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.context?.condition)
    res.status(200).json(await Users.find(req.context?.condition));
  } catch (error) {
    console.log(error)
    res.status(500).end();
  }
});


export default router
