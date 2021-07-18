const router = require('express').Router();
const oauthFlow = require('../src/oauth');



router.get('/', oauthFlow.redirectUser);

router.get('/code', oauthFlow.handleCode);

module.exports = router;