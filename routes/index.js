var express = require('express');
var router = express.Router();
// const redis = require("redis")
// const bluebird = require("bluebird")
// const client = redis.createClient()
// bluebird.promisifyAll(redis.RedisClient.prototype)
// bluebird.promisifyAll(redis.Multi.prototype)


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express',
    });
});
//
// router.get('/data/:symbol', function(req, res) {
//     var key = req.params.symbol;
//     client.get(key, function (err, reply) {
//         var result = []
//         if(!err && reply) {
//             result = JSON.parse(reply)
//         }
//         res.json(result)
//     })
// })
//
//
module.exports = router;
