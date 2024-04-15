import assert from 'assert';
import { Rank } from '../dist';
import { Redis } from 'ioredis';
import { after, describe, it } from 'node:test';
import { randomUUID } from 'crypto';

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

let rankKey = randomUUID()
let redis = new Redis()
let rankSrv = new Rank(redis, rankKey)

let user1 = {
  uid: "user1"
}

let user2 = {
  uid: "user2"
}

describe('redisRank', () => {
  after(async () => {
    await redis.del(rankKey)
    await redis.del(rankSrv.rankEndKey)
    console.log(`${colors.green} finished running tests ${colors.reset}`)
  })

  it('排行榜添加元素', async () => {
    await rankSrv.setRank(user1.uid, 1)
    let list = await rankSrv.getRankRange(0, 1)
    assert(list[0] == user1.uid, new Error("增加排行榜元素有误"))
  })

  it('增加用户分数', async () => {
    await rankSrv.rankIncrScore(user1.uid, 1)
    let score = await rankSrv.getScore(user1.uid)
    assert(score == 2, new Error("增加用户分数有误"))
  })

  it('排行榜', async () => {
    await rankSrv.rankIncrScore(user2.uid, 2)
    let list = await rankSrv.getRankRange(0, 2)
    assert(list[0] == user2.uid && list[1] == user1.uid, new Error("排行榜排名有误"))
    let rank = await rankSrv.getUserRank(user2.uid)
    assert(rank == 1, new Error("用户排名有误"))
    let user1Rank = await rankSrv.getUserRank(user1.uid)
    assert(user1Rank == 2, new Error("用户排名有误"))
  })
  
})
