const mongoose = require('mongoose');

const turretSchema = new mongoose.Schema({
  turretId: { type: Number, required: true, unique: true },
  level: { type: Number, required: true },
  name: { type: String, required: true },
  attack: { type: Number, required: true }, // 攻击力
  costPerBullet: { type: Number, required: true }, // 每发子弹消耗金币
  criticalRate: { type: Number, default: 0.05 }, // 暴击率
  criticalMultiplier: { type: Number, default: 2 }, // 暴击倍数
  unlockLevel: { type: Number, default: 1 }, // 解锁所需用户等级
  skinId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 初始化默认炮台数据（1-100级）
turretSchema.statics.initDefaultTurrets = async function() {
  const turrets = [];
  for (let i = 1; i <= 100; i++) {
    turrets.push({
      turretId: i,
      level: i,
      name: `炮台Lv.${i}`,
      attack: Math.floor(10 * Math.pow(1.1, i-1)), // 攻击力随等级增长
      costPerBullet: Math.floor(10 * Math.pow(1.1, i-1)), // 消耗金币同攻击力
      criticalRate: Math.min(0.05 + i * 0.001, 0.3), // 最高30%暴击率
      unlockLevel: i
    });
  }

  for (const turret of turrets) {
    await this.findOneAndUpdate({ turretId: turret.turretId }, turret, { upsert: true });
  }
  console.log('默认炮台数据初始化完成（1-100级）');
};

module.exports = mongoose.model('Turret', turretSchema);
