const SlotsCore = require('./SlotsCore');

/**
 * 海洋主题Slots（与捕鱼联动）
 */
class OceanSlots extends SlotsCore {
  constructor() {
    const config = {
      // 5个轴的符号配置
      reels: [
        ['fish', 'fish', 'turtle', 'shell', 'wild', 'starfish', 'bomb', 'bonus'],
        ['fish', 'turtle', 'turtle', 'shell', 'starfish', 'wild', 'bomb', 'bonus'],
        ['fish', 'turtle', 'devil_fish', 'shell', 'starfish', 'bomb', 'wild', 'bonus'],
        ['shark', 'turtle', 'devil_fish', 'shell', 'starfish', 'bomb', 'wild', 'bonus'],
        ['shark', 'gold_shark', 'devil_fish', 'shell', 'starfish', 'bomb', 'wild', 'bonus']
      ],
      // 20条支付线（行索引0,1,2对应上中下）
      paylines: [
        [1,1,1,1,1], // 中间线
        [0,0,0,0,0], // 上线
        [2,2,2,2,2], // 下线
        [0,1,2,1,0], // V型
        [2,1,0,1,2], // 倒V型
        [0,0,1,0,0], // 上锯齿
        [2,2,1,2,2], // 下锯齿
        [1,0,0,0,1], // 左凹
        [1,2,2,2,1], // 右凹
        [0,1,1,1,2], // 斜线右下
        [2,1,1,1,0], // 斜线右上
        [0,1,0,1,0], // 上点线
        [2,1,2,1,2], // 下点线
        [1,0,1,0,1], // 中点上
        [1,2,1,2,1], // 中点下
        [0,2,0,2,0], // 上下交错上
        [2,0,2,0,2], // 上下交错下
        [0,0,2,2,0], // 上上下下
        [2,2,0,0,2], // 下下上上
        [1,0,2,0,1]  // 中上下上中
      ],
      // 赔付表：3个、4个、5个的赔付倍数
      payoutTable: {
        'fish': [1, 3, 10],
        'starfish': [2, 5, 15],
        'turtle': [3, 8, 25],
        'devil_fish': [5, 15, 50],
        'shark': [10, 30, 100],
        'gold_shark': [20, 80, 500],
        'bomb': [2, 6, 20]
      },
      wildSymbol: 'wild',
      scatterSymbol: 'shell',
      bonusSymbol: 'bonus',
      rtp: 0.94
    };
    super(config);
    this.freeSpinMultiplier = 2; // 免费旋转期间奖励翻倍
  }

  // 重写免费旋转检查：3个以上贝壳触发15次免费旋转
  checkFreeSpin(reelsResult) {
    const scatterCount = this.countSymbol(reelsResult, this.scatterSymbol);
    if (scatterCount >= 3) {
      return {
        count: 15,
        multiplier: this.freeSpinMultiplier
      };
    }
    return false;
  }

  // 重写Bonus检查：3个以上宝箱触发捕鱼小游戏
  checkBonusGame(reelsResult) {
    const bonusCount = this.countSymbol(reelsResult, this.bonusSymbol);
    if (bonusCount >= 3) {
      return {
        type: 'fishing_game',
        reward: Math.floor(Math.random() * 50) + 10 // 10-60倍奖励
      };
    }
    return false;
  }
}

module.exports = OceanSlots;
