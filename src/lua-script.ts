export const rankIncrScoreLua = `
-- KEYS[1] key
-- ARGV[1] 成员
-- ARGV[2] 整数位增长的分数
-- ARGV[3] 小数位
local oriNum = redis.call('zscore', KEYS[1], ARGV[1])
if oriNum == false
then
  oriNum = 0
else
  oriNum = math.floor(tonumber(oriNum))
end
local finalNum = tostring(oriNum + ARGV[2]).."."..tostring(ARGV[3])
redis.call('zadd', KEYS[1], finalNum, ARGV[1])
return finalNum
`