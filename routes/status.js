var express = require('express');
var router = express.Router();
const database = require('../class/database')

/* GET users listing. */
router.get('/', async function(req, res, next) {
    res.render('status', {
        data: await database.getCurrentData()
    })
})

module.exports = router
