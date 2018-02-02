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
            this.clients[item.name] = {
                client: client,
                multiple: item.multiple
            }
        }
    }

    async getCurrentData() {
        let data = [], total = 0, issues = []
        for(let i in this.clients) {
            let results
            if(this.clients[i].multiple) {
                let multiResult = await this.fetchMultipleData(this.clients[i].client)
                results = multiResult.result
                issues = _.concat(issues, multiResult.closedAPIs)
            }else {
                results = [await this.fetchData(this.clients[i].client, i)]
            }
            for(let result of results) {
                data.push(result)
                total += result.profit
            }
        }
        return {data, total: _.round(total, 5), issues}
    }

    async fetchMultipleData(client) {
        let keys = (await client.keysAsync('app_*')).sort()
        let key = keys[keys.length-1]
        let appLog = JSON.parse(await client.getAsync(key))
        let tradeKeys = appLog.trades
        let closedAPIs = appLog.closedAPIs
        let trades = await client.mgetAsync(tradeKeys)
        let result = []
        for(let item of trades) {
            let data = JSON.parse(item)
            result.push(this.parseData(data, data.tradeSymbol))
        }
        return {result, closedAPIs}
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
        data.initTotalBalance = _.round(data.initTotalBalance, 5)
        data.initTotalStock = _.round(data.initTotalStock, 5)
        // data.closedExchanges = data.closedAPIs? data.closedAPIs.join(): []
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