const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 导入路由
const slotsRouter = require('./routes/slots');
const authRouter = require('./routes/auth');
const economyRouter = require('./routes/economy');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由配置
app.use('/api/slots', slotsRouter);
app.use('/api/auth', authRouter);
app.use('/api/economy', economyRouter);

// 测试接口
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '《欢乐渔乐城》后端服务运行正常', timestamp: new Date().toISOString() });
});

// MongoDB连接
const connectDB = async () => {
  try {
    // 临时使用内存数据库，后续可改为真实MongoDB地址
    // 开发阶段先不连接数据库，使用内存模拟
    console.log('数据库连接成功（开发阶段：模拟连接）');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// Socket.io实时通信
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // Slots实时旋转（可选，支持实时同步）
  socket.on('slots:spin', async (data) => {
    // 后续实现实时旋转逻辑
    socket.emit('slots:result', { code: 200, data: {} });
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 启动服务
const PORT = 3001; // 强制使用3001端口，避免冲突
server.listen(PORT, async () => {
  await connectDB();
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`健康检查地址: http://localhost:${PORT}/api/health`);
});

module.exports = app;
