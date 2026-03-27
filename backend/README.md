# 《欢乐渔乐城》后端服务
## 项目结构
```
backend/
├── src/
│   ├── slots/          # Slots核心逻辑
│   │   ├── SlotsCore.js    # Slots通用核心类
│   │   ├── OceanSlots.js   # 海洋主题Slots
│   │   ├── EgyptSlots.js   # 古埃及主题Slots
│   │   └── WealthSlots.js  # 财富宝藏主题Slots
│   ├── models/         # 数据模型
│   │   └── User.js         # 用户模型
│   ├── routes/         # 接口路由
│   │   ├── slots.js        # Slots相关接口
│   │   ├── auth.js         # 账号系统接口
│   │   └── economy.js      # 经济系统接口
│   └── app.js          # 项目入口文件
├── .env                # 环境配置
├── package.json        # 项目依赖
├── API_DOC.md          # 接口文档
└── README.md           # 项目说明
```

## 功能特性
### 已完成功能
1. ✅ 3款Slots核心逻辑开发（旋转、判定、奖励计算）
   - 海洋主题（与捕鱼联动）
   - 古埃及主题（高风险高回报）
   - 财富宝藏主题（低门槛高中奖率）
2. ✅ Slots HTTP接口（旋转、配置获取）
3. ✅ 账号系统基础功能（游客登录、用户信息查询）
4. ✅ 经济系统基础功能（金币增减、余额查询）
5. ✅ Socket.IO实时通信支持
6. ✅ 完整接口文档

### 待开发功能
- Slots特殊规则、小游戏联动逻辑（30h-48h）
- 任务、活动、社交系统后端逻辑（24h-36h）
- 数据库持久化
- JWT鉴权
- 反作弊系统
- 第三方SDK接入

## 快速启动
### 安装依赖
```bash
npm install
```

### 开发模式启动
```bash
npm run dev
```

### 生产模式启动
```bash
npm start
```

### 服务访问
- 服务地址：http://localhost:3001
- 健康检查：http://localhost:3001/api/health
- 接口文档：见API_DOC.md

## 技术栈
- Node.js + Express
- Socket.IO 实时通信
- MongoDB + Mongoose（后续接入）
- 支持CORS跨域
