const express = require('express');
const router = express.Router();

const Menu = require('../models/menuModel');

router.get('/', async (req, res) => {
    try {
        res.json(await Menu.find({}));
    } catch (e) {
        console.log(e)
        res.status(500).json({ result: 'error' })
    }
});

router.post('/', async (req, res) => {
    res.status(401).end();
});

router.delete('/', async (req, res) => {
    res.status(401).end();
});

module.exports = router; 