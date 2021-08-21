import express from 'express';
import firebase from "firebase";

const router = express.Router();

firebase.initializeApp({
    storageBucket: "zloi-space.appspot.com",
})
const storage = firebase.storage().ref();

router.get('/:file', async (req: express.Request, res: express.Response) => {
    try {      
        const url = await storage.child(req.params.file).getDownloadURL()
        console.log(url)
        res.redirect(url)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: e.message
        })
    }
});

export default router;
