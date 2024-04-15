
export interface RedisRankInte {

  // constructor(redisClient: Redis, rankKey: string): any; 

  /**
   * @description: 设置排行榜截止时间
   * @param {string} time 时间
   * @return {*}
   */
  setEndTime(time: string): Promise<string>;

  /**
   * @description: 获取排行榜截止时间
   * @return {*}
   */
  getEndTime(): Promise<string>;

  /**
   * @description: 生成处理后的分数
   * @param {number} score 分数
   * @param {number} timestamp 当前时间戳
   * @return {*}
   */
  genScore(score: number, timestamp: number): string;

  /**
   * @description: 更新用户排行榜分数
   * @param {number} user_id 用户id
   * @param {number} score 分数
   * @param {*} timestamp 时间戳
   * @return {*}
   */
  setRank(user_id: number | string, score: number, timestamp: number): Promise<number>;

  /**
   * @description: 获取用户排行
   * @param {number} user_id 用户id
   * @return {*}
   */
  getUserRank(user_id: number | string): Promise<number | null>;

  /**
   * @description: 按照分数倒叙排行
   * @param {number} start 开始
   * @param {number} stop 结束
   * @return {*}
   */
  getRankRange(start: number, stop: number): Promise<string[]>;
  

  /**
   * @description: 获取用户分数
   * @param {number} user_id 用户id
   * @return {*}
   */
  getScore(user_id: number | string): Promise<number>;

  /**
   * @description: 返回排行榜总人数
   * @return {*}
   */
  getCount(): Promise<number>;

  /**
   * @description: 排行榜增加分数
   * @param {string} user_id 用户id
   * @param {number} incrScore 增加的分数(整数)
   * @param {*} timestamp 时间戳
   * @return {*}
   */
  rankIncrScore(user_id: string, incrScore: number, timestamp: number): Promise<string>;
}