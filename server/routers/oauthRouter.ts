const router = require('express').Router();
const oauthFlow = require('../src/oauth');
const checker = require('../middleware/schemaChecker');


router.get('/', [checker.check('params', { method: String, device: String })], oauthFlow.redirectUser);

router.get('/code', oauthFlow.handleCode);

export default router;