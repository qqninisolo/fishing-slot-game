const mongoose = require('mongoose');

const fishSchema = new mongoose.Schema({
  fishId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  rate: { type: Number, required: true }, // 倍率
  hp: { type: Number, required: true }, // 血量
  speed: { type: Number, required: true, default: 1 }, // 移动速度
  specialType: { 
    type: String, 
    enum: ['normal', 'fast', 'high_hp', 'boss'], 
    default: 'normal' 
  },
  score: { type: Number, required: true }, // 基础分值
  dropProbability: { type: Number, default: 0.1 }, // 道具掉落概率
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 初始化默认鱼类数据
fishSchema.statics.initDefaultFish = async function() {
  const defaultFish = [
    { fishId: 1, name: '小金鱼', level: 1, rate: 2, hp: 10, speed: 1.2, specialType: 'normal', score: 20 },
    { fishId: 2, name: '小丑鱼', level: 2, rate: 5, hp: 25, speed: 1.0, specialType: 'normal', score: 50 },
    { fishId: 3, name: '海龟', level: 3, rate: 10, hp: 100, speed: 0.6, specialType: 'normal', score: 100 },
    { fishId: 4, name: '魔鬼鱼', level: 4, rate: 20, hp: 200, speed: 1.5, specialType: 'fast', score: 200 },
    { fishId: 5, name: '鲨鱼', level: 5, rate: 50, hp: 1000, speed: 0.8, specialType: 'high_hp', score: 500 },
    { fishId: 6, name: '黄金鲨鱼', level: 6, rate: 100, hp: 3000, speed: 0.7, specialType: 'high_hp', score: 1000 },
    { fishId: 7, name: '海龙王', level: 7, rate: 300, hp: 10000, speed: 0.5, specialType: 'boss', score: 3000 }
  ];

  for (const fish of defaultFish) {
    await this.findOneAndUpdate({ fishId: fish.fishId }, fish, { upsert: true });
  }
  console.log('默认鱼类数据初始化完成');
};

module.exports = mongoose.model('Fish', fishSchema);
