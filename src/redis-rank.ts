import { Redis } from "ioredis";
import { Err } from "./error";
import { rankIncrScoreLua } from "./lua-script";
import { RedisRankInte } from "./interface";



declare module "ioredis" {
  interface Redis {
    blockFrequently(key: string, limitMs: number, limit: number, blockMs: number): Promise<number>;
    rankIncrScore(key: string, member: string, score: number, Decimal: number): Promise<string>;
  }
  interface Cluster {
    blockFrequently(key: string, limitMs: number, limit: number, blockMs: number): Promise<number>;
    rankIncrScore(key: string, member: string, score: number, Decimal: number): Promise<string>;
  }
}

export class Rank implements RedisRankInte {
  public readonly rankKey: string
  protected rankEndDate = "2200-01-01 00:00:00"
  public readonly rankEndKey: string
  public readonly redis: Redis

  /**
   * @description: 基于redis实现的按照积分和时间倒叙排列的排行榜
   * @param {Redis} redisClient redis实例
   * @param {string} rankKey  排行榜的key名
   * @return {*}
   */
  constructor(redisClient: Redis, rankKey: string, rankEndDate?: string){
    this.redis = redisClient
    this.rankKey = rankKey
    this.rankEndKey = `${rankKey}:rankEndKey`
    if(rankEndDate){
      if(new Date(rankEndDate).toString() == "Invalid Date") throw new Err({ message: "排行榜结束时间有误", code: -1001 })
      this.rankEndDate = rankEndDate
    }
    this.redis.defineCommand("rankIncrScore", {
      numberOfKeys: 1,
      lua: rankIncrScoreLua
    })
  }

  /**
   * @description: 设置排行榜截止时间
   * @param {string} time 时间
   * @return {*}
   */
  async setEndTime(time: string) {
    if(new Date(time).toString() == "Invalid Date") throw new Err({ message: "排行榜结束时间有误", code: -1001 })
    this.rankEndDate = time
    return await this.redis.set(this.rankEndKey, time)
  }

  /**
   * @description: 获取排行榜截止时间
   * @return {*}
   */
  async getEndTime() {
    return await this.redis.get(this.rankEndKey) || this.rankEndDate
  }

  /**
   * @description: 生成处理后的分数
   * @param {number} score 分数
   * @param {number} timestamp 当前时间戳
   * @return {*}
   */
  genScore(score: number, timestamp: number) {
    let timeDiff = Math.floor((new Date(this.rankEndDate).getTime() - timestamp) / 1000)
    return `${score}.${timeDiff}`
  }

  /**
   * @description: 更新用户排行榜分数
   * @param {number} user_id 用户id
   * @param {number} score 分数
   * @param {*} timestamp 时间戳
   * @return {*}
   */
  async setRank(user_id: number | string, score: number, timestamp = Date.now()) {
    let endTime = await this.getEndTime()
    if(endTime && new Date(endTime).getTime() < Date.now()) throw new Err({ message: "排行榜已截止", code: -1000 })
    return await this.redis.zadd(this.rankKey, this.genScore(score, timestamp), user_id)
  }

  /**
   * @description: 获取用户排行(不存在则为0)
   * @param {number} user_id 用户id
   * @return {*}
   */
  async getUserRank(user_id: number | string) {
    let _rank = await this.redis.zrevrank(this.rankKey, String(user_id))
    return ( _rank === null ? -1 : _rank) + 1
  }

  /**
   * @description: 按照分数倒序排行
   * @param {number} start 开始
   * @param {number} stop 结束
   * @return {*}
   */
  async getRankRange(start: number, stop: number) {
    return await this.redis.zrevrange(this.rankKey, start, stop)
  }
  

  /**
   * @description: 获取用户分数
   * @param {number} user_id 用户id
   * @return {*}
   */
  async getScore(user_id: number | string) {
    let result = await this.redis.zscore(this.rankKey, String(user_id))
    return Number((result || "").split('.')[0])
  }

  /**
   * @description: 返回排行榜总人数
   * @return {*}
   */
  async getCount() {
    return await this.redis.zcard(this.rankKey)
  }

  /**
   * @description: 排行榜增加分数
   * @param {string} user_id 用户id
   * @param {number} incrScore 增加的分数(整数)
   * @param {*} timestamp 时间戳
   * @return {*}
   */
  async rankIncrScore(user_id: string, incrScore: number, timestamp = Date.now()) {
    let endTime = await this.getEndTime()
    if(endTime && new Date(endTime).getTime() < Date.now()) throw new Err({ message: "排行榜已截止", code: -1000 })
    return await this.redis.rankIncrScore(this.rankKey, user_id, incrScore, Number(this.genScore(incrScore, timestamp).split('.')[1]))
  }
}
