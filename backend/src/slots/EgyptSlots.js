const SlotsCore = require('./SlotsCore');

/**
 * 古埃及主题Slots
 * 高风险高回报，最高10000倍奖励
 */
class EgyptSlots extends SlotsCore {
  constructor() {
    const config = {
      reels: [
        ['scarab', 'ankh', 'eye', 'pyramid', 'pharaoh', 'mummy', 'cat', 'bonus'],
        ['scarab', 'ankh', 'ankh', 'eye', 'pyramid', 'pharaoh', 'mummy', 'bonus'],
        ['scarab', 'ankh', 'eye', 'eye', 'pyramid', 'pharaoh', 'mummy', 'bonus'],
        ['scarab', 'ankh', 'eye', 'pyramid', 'pyramid', 'pharaoh', 'mummy', 'bonus'],
        ['scarab', 'ankh', 'eye', 'pyramid', 'pharaoh', 'pharaoh', 'mummy', 'bonus']
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
        'scarab': [1, 2, 5],
        'cat': [2, 4, 10],
        'ankh': [3, 8, 20],
        'eye': [5, 15, 50],
        'mummy': [10, 40, 200],
        'pyramid': [20, 100, 1000],
        'pharaoh': [50, 500, 10000]
      },
      wildSymbol: 'pharaoh',
      scatterSymbol: 'pyramid',
      bonusSymbol: 'mummy',
      rtp: 0.92 // 高风险高回报，RTP稍低
    };
    super(config);
    this.wildMultiplier = 5; // Wild最高叠加5倍
  }

  // 重写赔付计算，增加Wild倍率
  calculateWin(reelsResult, betAmount) {
    const result = super.calculateWin(reelsResult, betAmount);
    // 计算Wild数量，叠加倍率
    const wildCount = this.countSymbol(reelsResult, this.wildSymbol);
    if (wildCount > 0) {
      const multiplier = Math.min(wildCount, this.wildMultiplier);
      result.winAmount = Math.floor(result.winAmount * multiplier);
      result.wildMultiplier = multiplier;
    }
    return result;
  }

  // 重写免费旋转：3个以上金字塔触发，最多叠加100次
  checkFreeSpin(reelsResult) {
    const scatterCount = this.countSymbol(reelsResult, this.scatterSymbol);
    if (scatterCount >= 3) {
      const freeSpins = scatterCount === 3 ? 10 : scatterCount === 4 ? 30 : 100;
      return {
        count: freeSpins,
        multiplier: 3
      };
    }
    return false;
  }

  // 重写Bonus游戏：木乃伊触发寻宝小游戏，最高10000倍
  checkBonusGame(reelsResult) {
    const bonusCount = this.countSymbol(reelsResult, this.bonusSymbol);
    if (bonusCount >= 3) {
      const reward = bonusCount === 3 ? 
        Math.floor(Math.random() * 100) + 10 :
        bonusCount === 4 ?
          Math.floor(Math.random() * 1000) + 100 :
          10000;
      return {
        type: 'treasure_hunt',
        reward
      };
    }
    return false;
  }
}

module.exports = EgyptSlots;
