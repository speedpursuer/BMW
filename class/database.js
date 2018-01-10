const bluebird = require("bluebird")
const redis = require("redis")
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const redisList = require("../config/redisList")
const moment = require('moment')
const _ = require('lodash')

class Database {
    constructor() {
        this.creatClients()
    }

    creatClients() {
        this.clients = {}
        for(var item of redisList) {
            const client = redis.createClient({
                host: item.host,
                port: item.post,
                password: item.password
            })
            client.auth(item.password)
            this.clients[item.name] = client
        }
    }

    async getCurrentData() {
        let data = [], total = 0
        for(var i in this.clients) {
            let result = await this.fetchData(this.clients[i], i)
            data.push(result)
            total += result.profit
        }
        return {data, total: _.round(total, 5)}
    }

    async fetchData(client, name) {
        let keys = (await client.keysAsync('*')).sort()
        let key = keys[keys.length-1]
        let data = JSON.parse(await client.getAsync(key))
        return this.parseData(data, name)
    }

    parseData(data, name) {
        data.name = name
        data.days = this.timeDiff(data.startTime, data.lastUpdate)
        data.profit = _.round(data.profit, 5)
        data.closedExchanges = data.closedAPIs.join()
        return data
    }

    timeDiff(earlier, later) {
        var a = moment(earlier);
        var b = moment(later);
        return _.round(b.diff(a, 'days', true), 1)
    }

    // async getData() {
    //     return JSON.parse(await client.getAsync(this.key))
    // }
    //
    // async saveData(data) {
    //     await client.setAsync(this.key, JSON.stringify(data))
    // }
    //
    // async saveDataWithKey(data, key) {
    //     await client.setAsync(key, JSON.stringify(data))
    // }
    //
    // async deleteData() {
    //     return await client.delAsync(this.key)
    // }
}
var database = new Database()
module.exports = database