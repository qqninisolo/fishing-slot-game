const Fish = require('../models/Fish');
const User = require('../models/User');
const Turret = require('../models/Turret');

// 在线用户房间
const rooms = new Map();
// 房间内鱼群数据
const roomFishes = new Map();
// 房间内用户状态
const roomUsers = new Map();

// 鱼群生成间隔（毫秒）
const FISH_SPAWN_INTERVAL = 2000;
// 最大鱼群数量
const MAX_FISH_PER_ROOM = 50;

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('用户连接捕鱼游戏:', socket.id);

    // 加入房间
    socket.on('joinRoom', async ({ userId, roomId = 'default' }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
        roomFishes.set(roomId, []);
        roomUsers.set(roomId, new Map());
        // 启动鱼群生成定时器
        startFishSpawn(io, roomId);
      }
      
      rooms.get(roomId).add(socket.id);
      
      // 获取用户信息
      const user = await User.findOne({ userId });
      if (user) {
        roomUsers.get(roomId).set(socket.id, {
          userId,
          userName: user.username,
          level: user.level,
          currentTurretLevel: user.currentTurretLevel,
          coins: user.coins,
          diamonds: user.diamonds
        });
      }

      // 通知房间内其他用户
      io.to(roomId).emit('userJoined', {
        userId,
        userName: user?.username || '游客',
        onlineCount: rooms.get(roomId).size
      });

      // 发送当前房间鱼群和用户列表
      socket.emit('roomInfo', {
        fishes: roomFishes.get(roomId),
        users: Array.from(roomUsers.get(roomId).values())
      });

      console.log(`用户 ${userId} 加入房间 ${roomId}`);
    });

    // 炮台发射子弹
    socket.on('fireBullet', async ({ userId, roomId, turretLevel, angle, targetFishId }) => {
      try {
        const user = await User.findOne({ userId });
        const turret = await Turret.findOne({ level: turretLevel });
        
        if (!user || !turret) return;
        if (user.coins < turret.costPerBullet) {
          socket.emit('error', { message: '金币不足，无法发射' });
          return;
        }

        // 扣除金币
        user.coins -= turret.costPerBullet;
        await user.save();

        // 广播子弹发射事件
        io.to(roomId).emit('bulletFired', {
          userId,
          bulletId: `${socket.id}_${Date.now()}`,
          turretLevel,
          angle,
          targetFishId,
          attack: turret.attack,
          remainingCoins: user.coins
        });

        // 更新用户状态
        const roomUser = roomUsers.get(roomId)?.get(socket.id);
        if (roomUser) {
          roomUser.coins = user.coins;
        }
      } catch (error) {
        console.error('发射子弹错误:', error);
      }
    });

    // 碰撞命中判定
    socket.on('hitFish', async ({ userId, roomId, fishId, bulletId, damage }) => {
      try {
        const fishes = roomFishes.get(roomId);
        if (!fishes) return;

        const fishIndex = fishes.findIndex(f => f.id === fishId);
        if (fishIndex === -1) return;

        const fish = fishes[fishIndex];
        fish.hp -= damage;

        // 鱼被打死
        if (fish.hp <= 0) {
          // 移除鱼
          fishes.splice(fishIndex, 1);
          
          // 计算奖励
          const reward = fish.rate * 10;
          const user = await User.findOne({ userId });
          if (user) {
            user.coins += reward;
            user.addExp(reward * 0.1);
            await user.save();

            // 广播鱼被击杀消息
            io.to(roomId).emit('fishKilled', {
              userId,
              fishId,
              reward,
              remainingCoins: user.coins,
              level: user.level,
              exp: user.exp
            });

            // 更新用户状态
            const roomUser = roomUsers.get(roomId)?.get(socket.id);
            if (roomUser) {
              roomUser.coins = user.coins;
              roomUser.level = user.level;
            }
          }
        } else {
          // 更新鱼的血量
          fishes[fishIndex] = fish;
          io.to(roomId).emit('fishDamaged', { fishId, remainingHp: fish.hp });
        }
      } catch (error) {
        console.error('命中判定错误:', error);
      }
    });

    // 切换炮台
    socket.on('switchTurret', async ({ userId, roomId, turretLevel }) => {
      try {
        const user = await User.findOne({ userId });
        if (!user || !user.unlockedTurrets.includes(turretLevel)) return;

        user.currentTurretLevel = turretLevel;
        await user.save();

        io.to(roomId).emit('turretSwitched', {
          userId,
          turretLevel
        });

        const roomUser = roomUsers.get(roomId)?.get(socket.id);
        if (roomUser) {
          roomUser.currentTurretLevel = turretLevel;
        }
      } catch (error) {
        console.error('切换炮台错误:', error);
      }
    });

    // 离开房间
    socket.on('leaveRoom', ({ roomId, userId }) => {
      leaveRoom(socket, roomId, userId);
    });

    // 断开连接
    socket.on('disconnect', () => {
      // 清理用户所在房间
      rooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          const user = roomUsers.get(roomId)?.get(socket.id);
          leaveRoom(socket, roomId, user?.userId);
        }
      });
      console.log('用户断开连接:', socket.id);
    });
  });
};

// 鱼群生成逻辑
function startFishSpawn(io, roomId) {
  setInterval(async () => {
    const fishes = roomFishes.get(roomId);
    if (!fishes || fishes.length >= MAX_FISH_PER_ROOM) return;

    // 随机生成鱼类，70%概率普通鱼，20%中级，8%高级，2%Boss
    const random = Math.random();
    let fishConfig;
    if (random < 0.7) {
      const fishIds = [1, 2, 3];
      fishConfig = await Fish.findOne({ fishId: fishIds[Math.floor(Math.random() * fishIds.length)] });
    } else if (random < 0.9) {
      const fishIds = [4, 5];
      fishConfig = await Fish.findOne({ fishId: fishIds[Math.floor(Math.random() * fishIds.length)] });
    } else if (random < 0.98) {
      fishConfig = await Fish.findOne({ fishId: 6 });
    } else {
      fishConfig = await Fish.findOne({ fishId: 7 });
    }

    if (fishConfig) {
      const newFish = {
        id: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fishId: fishConfig.fishId,
        name: fishConfig.name,
        level: fishConfig.level,
        rate: fishConfig.rate,
        hp: fishConfig.hp,
        maxHp: fishConfig.hp,
        speed: fishConfig.speed,
        specialType: fishConfig.specialType,
        spawnPoint: Math.random() > 0.5 ? 'left' : 'right', // 出生点左右随机
        path: Math.floor(Math.random() * 5) // 移动路径类型0-4
      };

      fishes.push(newFish);
      io.to(roomId).emit('fishSpawned', newFish);
    }
  }, FISH_SPAWN_INTERVAL);
}

// 离开房间处理
function leaveRoom(socket, roomId, userId) {
  if (!rooms.has(roomId)) return;
  
  rooms.get(roomId).delete(socket.id);
  roomUsers.get(roomId)?.delete(socket.id);
  socket.leave(roomId);

  // 通知其他用户
  io.to(roomId).emit('userLeft', {
    userId,
    onlineCount: rooms.get(roomId).size
  });

  // 房间为空则清理
  if (rooms.get(roomId).size === 0) {
    rooms.delete(roomId);
    roomFishes.delete(roomId);
    roomUsers.delete(roomId);
    console.log(`房间 ${roomId} 已销毁`);
  }
}
