const SlotsCore = require('./SlotsCore');

/**
 * 财富宝藏主题Slots
 * 低门槛高中奖率，适合新手
 */
class WealthSlots extends SlotsCore {
  constructor() {
    const config = {
      reels: [
        ['coin', 'ingot', 'jade', 'yuanbao', 'gold', 'caishen', 'red_envelope', 'bonus'],
        ['coin', 'coin', 'ingot', 'jade', 'yuanbao', 'gold', 'caishen', 'bonus'],
        ['coin', 'ingot', 'ingot', 'jade', 'yuanbao', 'gold', 'caishen', 'bonus'],
        ['coin', 'ingot', 'jade', 'jade', 'yuanbao', 'gold', 'caishen', 'bonus'],
        ['coin', 'ingot', 'jade', 'yuanbao', 'yuanbao', 'gold', 'caishen', 'bonus']
      ],
      paylines: [
        [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2],
        [0,1,2,1,0], [2,1,0,1,2], [0,0,1,0,0],
        [2,2,1,2,2], [1,0,0,0,1], [1,2,2,2,1],
        [0,1,1,1,2], [2,1,1,1,0], [0,1,0,1,0],
        [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1],
        [0,2,0,2,0], [2,0,2,0,2], [0,0,2,2,0],
        [2,2,0,0,2], [1,0,2,0,1]
      ],
      payoutTable: {
        'coin': [0.5, 1, 3],
        'red_envelope': [1, 2, 5],
        'ingot': [1.5, 3, 8],
        'jade': [2, 5, 15],
        'yuanbao': [3, 10, 30],
        'gold': [5, 20, 80],
        'caishen': [10, 50, 200]
      },
      wildSymbol: 'coin',
      scatterSymbol: 'yuanbao',
      bonusSymbol: 'caishen',
      rtp: 0.96 // 高中奖率，RTP更高
    };
    super(config);
  }

  // 重写Wild奖励：出现即奖励对应倍数
  calculateWin(reelsResult, betAmount) {
    const result = super.calculateWin(reelsResult, betAmount);
    // 每个Wild额外奖励0.5倍下注
    const wildCount = this.countSymbol(reelsResult, this.wildSymbol);
    const wildBonus = wildCount * 0.5 * betAmount;
    result.winAmount += Math.floor(wildBonus);
    result.wildBonus = wildBonus;
    return result;
  }

  // 重写免费旋转：2个元宝即可触发
  checkFreeSpin(reelsResult) {
    const scatterCount = this.countSymbol(reelsResult, this.scatterSymbol);
    if (scatterCount >= 2) {
      const freeSpins = scatterCount === 2 ? 5 : scatterCount === 3 ? 10 : scatterCount === 4 ? 20 : 50;
      return {
        count: freeSpins,
        multiplier: 1.5
      };
    }
    return false;
  }

  // 重写Bonus游戏：财神触发红包雨，最低10倍
  checkBonusGame(reelsResult) {
    const bonusCount = this.countSymbol(reelsResult, this.bonusSymbol);
    if (bonusCount >= 3) {
      const minReward = 10;
      const maxReward = bonusCount === 3 ? 50 : bonusCount === 4 ? 200 : 1000;
      const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
      return {
        type: 'red_envelope_rain',
        reward
      };
    }
    return false;
  }
}

module.exports = WealthSlots;
