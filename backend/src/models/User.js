const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 账号信息
  userId: { type: String, required: true, unique: true },
  username: { type: String, default: '游客' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  openId: { type: String, default: '' }, // 第三方登录ID
  userType: { type: String, enum: ['guest', 'normal', 'minor', 'vip'], default: 'guest' },
  
  // 经济信息
  coins: { type: Number, default: 10000 }, // 初始金币10000
  diamonds: { type: Number, default: 100 }, // 初始钻石100
  items: {
    freeze: { type: Number, default: 5 },
    bomb: { type: Number, default: 3 },
    lock: { type: Number, default: 10 }
  },

  // 等级信息
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  vipLevel: { type: Number, default: 0 },

  // 统计信息
  totalWin: { type: Number, default: 0 },
  totalBet: { type: Number, default: 0 },
  fishCaught: { type: Number, default: 0 },
  slotsSpins: { type: Number, default: 0 },

  // 防沉迷信息
  dailyPlayTime: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },

  // 时间戳
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 保存前更新更新时间
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
