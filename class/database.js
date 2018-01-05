const bluebird = require("bluebird")
const redis = require("redis")
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const redisList = require("../config/redisList")

class Database {
    constructor() {
        this.creatClients()
    }

    creatClients() {
        this.clients = {}
        for(var item of redisList) {
            const client = redis.createClient({
                host: item.host,
                port: item.post
            })
            this.clients[item.name] = client
        }
    }

    async getCurrentData() {
        let result = []
        for(var i in this.clients) {
            result.push(await this.fetchData(this.clients[i], i))
        }
        return result
    }

    async fetchData(client, name) {
        let keys = (await client.keysAsync('*')).sort()
        let key = keys[keys.length-1]
        let data = JSON.parse(await client.getAsync(key))
        data.name = name
        return data
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