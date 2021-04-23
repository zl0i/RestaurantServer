const express = require('express')
const Shop = require('../models/shopsModel')

const router = express.Router()

router.get('/', async (req, res) => {
    try {        
        res.json(await Shop.find({}));
    } catch (error) {
        res.status(400).end()
    }
});

module.exports = router; 
