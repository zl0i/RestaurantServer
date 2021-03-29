const express = require('express')
const Address = require('../models/addressModel')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        res.json(await Address.find());
    } catch (error) {
        res.status(400).end()
    }
});

module.exports = router; 
