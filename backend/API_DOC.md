# 《欢乐渔乐城》后端接口文档
## 一、服务信息
- 服务地址：http://localhost:3001
- 通信协议：HTTP + WebSocket
- 数据格式：JSON

## 二、通用返回格式
```json
{
  "code": 200, // 状态码：200成功，4xx参数错误，5xx服务器错误
  "message": "success", // 提示信息
  "data": {} // 返回数据
}
```

## 三、Slots相关接口
### 3.1 旋转Slots
- 接口地址：`POST /api/slots/spin`
- 接口描述：执行Slots旋转，返回结果
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | Slots类型：ocean（海洋主题）/egypt（古埃及主题）/wealth（财富宝藏主题） |
| betAmount | number | 是 | 下注金额，范围：10-10000 |
| userId | string | 是 | 用户ID |
- 返回示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "type": "ocean",
    "betAmount": 100,
    "reels": [
      ["fish", "turtle", "wild"],
      ["shell", "starfish", "fish"],
      ["bonus", "turtle", "devil_fish"],
      ["shell", "shark", "wild"],
      ["gold_shark", "shell", "bonus"]
    ],
    "winAmount": 500,
    "paylineWins": [
      {
        "payline": 1,
        "symbols": ["turtle", "starfish", "turtle", "shark", "shell"],
        "matchCount": 3,
        "win": 200
      }
    ],
    "scatterWins": 300,
    "bonusWins": 0,
    "hasFreeSpin": {
      "count": 15,
      "multiplier": 2
    },
    "hasBonusGame": false
  }
}
```

### 3.2 获取Slots配置
- 接口地址：`GET /api/slots/config/:type`
- 接口描述：获取指定Slots的配置信息（赔付表、支付线等）
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | Slots类型 |
- 返回示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "paylines": [[1,1,1,1,1], [0,0,0,0,0], ...],
    "payoutTable": {
      "fish": [1, 3, 10],
      "turtle": [3, 8, 25],
      ...
    },
    "wildSymbol": "wild",
    "scatterSymbol": "shell",
    "bonusSymbol": "bonus"
  }
}
```

## 四、账号系统接口
### 4.1 游客登录
- 接口地址：`POST /api/auth/guest/login`
- 接口描述：游客快速登录，创建新账号
- 请求参数：无
- 返回示例：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "guest_abc123def456",
    "username": "游客123456",
    "avatar": "",
    "coins": 10000,
    "diamonds": 100,
    "level": 1,
    "vipLevel": 0,
    "token": "xxx"
  }
}
```

### 4.2 获取用户信息
- 接口地址：`GET /api/auth/user/:userId`
- 接口描述：获取用户详细信息
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
- 返回示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "guest_abc123def456",
    "username": "游客123456",
    "avatar": "",
    "phone": "",
    "userType": "guest",
    "coins": 10000,
    "diamonds": 100,
    "items": {
      "freeze": 5,
      "bomb": 3,
      "lock": 10
    },
    "level": 1,
    "exp": 0,
    "vipLevel": 0,
    "totalWin": 0,
    "totalBet": 0,
    "fishCaught": 0,
    "slotsSpins": 0
  }
}
```

## 五、经济系统接口
### 5.1 扣除金币
- 接口地址：`POST /api/economy/coins/deduct`
- 接口描述：扣除用户金币（如下注、购买道具）
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| amount | number | 是 | 扣除金额 |
| reason | string | 否 | 扣除原因 |
- 返回示例：
```json
{
  "code": 200,
  "message": "扣除成功",
  "data": {
    "coins": 9900,
    "deducted": 100
  }
}
```

### 5.2 增加金币
- 接口地址：`POST /api/economy/coins/add`
- 接口描述：给用户增加金币（如中奖、任务奖励）
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| amount | number | 是 | 增加金额 |
| reason | string | 否 | 增加原因 |
- 返回示例：
```json
{
  "code": 200,
  "message": "增加成功",
  "data": {
    "coins": 10500,
    "added": 500
  }
}
```

### 5.3 获取用户余额
- 接口地址：`GET /api/economy/balance/:userId`
- 接口描述：获取用户金币、钻石、道具数量
- 请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
- 返回示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "coins": 10000,
    "diamonds": 100,
    "items": {
      "freeze": 5,
      "bomb": 3,
      "lock": 10
    }
  }
}
```

## 六、健康检查接口
### 6.1 服务健康检查
- 接口地址：`GET /api/health`
- 接口描述：检查服务是否正常运行
- 返回示例：
```json
{
  "code": 200,
  "message": "《欢乐渔乐城》后端服务运行正常",
  "timestamp": "2026-03-26T02:40:00.000Z"
}
```
