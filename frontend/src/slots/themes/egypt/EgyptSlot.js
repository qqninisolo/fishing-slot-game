import SlotMachine from '../../core/SlotMachine';

/**
 * 古埃及主题Slots（高风险高回报）
 */
class EgyptSlot extends SlotMachine {
  constructor() {
    super({
      reels: 5,
      rows: 3,
      paylines: 20,
      minBet: 10,
      maxBet: 10000,
      rtp: 0.92 // 高风险高回报，回报率略低
    });

    this.symbols = {
      WILD: 'PHARAOH', // 法老Wild符号，带倍率
      SCATTER: 'PYRAMID', // 金字塔Scatter
      BONUS: 'MUMMY', // 木乃伊Bonus
      ANKH: 'ANKH', // 生命符
      SCARAB: 'SCARAB', // 圣甲虫
      EYE: 'EYE', // 荷鲁斯之眼
      SPHINX: 'SPHINX', // 狮身人面像
      CROCODILE: 'CROCODILE', // 鳄鱼
      SCORPION: 'SCORPION' // 蝎子
    };

    // 各轴符号概率配置
    this.reelProbabilities = [
      { PHARAOH: 0.01, PYRAMID: 0.02, MUMMY: 0.01, ANKH: 0.17, SCARAB: 0.17, EYE: 0.17, SPHINX: 0.15, CROCODILE: 0.15, SCORPION: 0.15 },
      { PHARAOH: 0.01, PYRAMID: 0.02, MUMMY: 0.01, ANKH: 0.17, SCARAB: 0.17, EYE: 0.17, SPHINX: 0.15, CROCODILE: 0.15, SCORPION: 0.15 },
      { PHARAOH: 0.01, PYRAMID: 0.02, MUMMY: 0.01, ANKH: 0.17, SCARAB: 0.17, EYE: 0.17, SPHINX: 0.15, CROCODILE: 0.15, SCORPION: 0.15 },
      { PHARAOH: 0.01, PYRAMID: 0.02, MUMMY: 0.01, ANKH: 0.17, SCARAB: 0.17, EYE: 0.17, SPHINX: 0.15, CROCODILE: 0.15, SCORPION: 0.15 },
      { PHARAOH: 0.01, PYRAMID: 0.02, MUMMY: 0.01, ANKH: 0.17, SCARAB: 0.17, EYE: 0.17, SPHINX: 0.15, CROCODILE: 0.15, SCORPION: 0.15 }
    ];

    // 符号倍数配置
    this.symbolMultipliers = {
      SPHINX: { 3: 50, 4: 500, 5: 10000 }, // 最高10000倍
      EYE: { 3: 30, 4: 300, 5: 5000 },
      SCARAB: { 3: 20, 4: 200, 5: 2000 },
      ANKH: { 3: 15, 4: 150, 5: 1000 },
      CROCODILE: { 3: 10, 4: 100, 5: 500 },
      SCORPION: { 3: 5, 4: 50, 5: 200 }
    };

    this.maxFreeSpins = 100; // 最多叠加100次免费旋转
  }

  /**
   * 重写获取随机符号方法
   */
  getRandomSymbol(reelIndex) {
    const probabilities = this.reelProbabilities[reelIndex];
    const random = Math.random();
    let cumulative = 0;

    for (const [symbol, prob] of Object.entries(probabilities)) {
      cumulative += prob;
      if (random <= cumulative) {
        return symbol;
      }
    }

    return 'SCORPION'; // 保底
  }

  /**
   * 重写Wild判断
   */
  isWild(symbol) {
    return symbol === this.symbols.WILD;
  }

  /**
   * 重写线奖励计算（法老Wild带叠加倍率）
   */
  getLineWin(symbols) {
    let firstSymbol = symbols[0];
    let count = 1;
    let wildMultiplier = 1;
    let wildCount = 0;

    // 计算Wild数量和倍率
    symbols.forEach(symbol => {
      if (this.isWild(symbol)) {
        wildCount++;
        wildMultiplier *= 2; // 每个Wild翻倍，最高5倍
      }
    });
    wildMultiplier = Math.min(wildMultiplier, 5); // 最高5倍

    // 处理Wild替代
    for (let i = 0; i < symbols.length; i++) {
      if (this.isWild(symbols[i]) && i === 0) {
        // 第一个是Wild，找后面第一个非Wild作为基准符号
        for (let j = 1; j < symbols.length; j++) {
          if (!this.isWild(symbols[j])) {
            firstSymbol = symbols[j];
            break;
          }
        }
      }
    }

    // 计算连续匹配数量
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol || this.isWild(symbols[i])) {
        count++;
      } else {
        break;
      }
    }

    if (count < 3 || !this.symbolMultipliers[firstSymbol]) {
      return { multiplier: 0, symbolType: null };
    }

    const baseMultiplier = this.symbolMultipliers[firstSymbol][count] || 0;
    return {
      multiplier: baseMultiplier * wildMultiplier,
      symbolType: firstSymbol,
      wildMultiplier
    };
  }

  /**
   * 重写特殊奖励计算
   */
  calculateSpecialWins() {
    const wins = [];
    const allSymbols = this.reels.flat();
    
    // Scatter奖励：3个以上触发免费旋转，可叠加到100次
    const scatterCount = allSymbols.filter(s => s === this.symbols.SCATTER).length;
    if (scatterCount >= 3) {
      const freeSpins = Math.min(scatterCount * 5, this.maxFreeSpins - this.freeSpins);
      const multiplier = Math.min(scatterCount, 10);
      
      wins.push({
        type: 'scatter',
        count: scatterCount,
        reward: this.currentBet * scatterCount * 10,
        multiplier,
        freeSpins,
        message: `恭喜获得${freeSpins}次免费旋转！奖励${multiplier}倍！`
      });
    }

    // Bonus奖励：3个以上触发寻宝小游戏，最高10000倍
    const bonusCount = allSymbols.filter(s => s === this.symbols.BONUS).length;
    if (bonusCount >= 3) {
      const bonusMultiplier = Math.min(bonusCount * 1000, 10000);
      wins.push({
        type: 'bonus',
        count: bonusCount,
        reward: this.currentBet * bonusMultiplier,
        triggerGame: 'treasureHunt',
        message: `触发寻宝小游戏！获得${bonusMultiplier}倍奖励！`
      });
    }

    return wins;
  }

  /**
   * 重写特殊规则处理
   */
  handleSpecialRules(result) {
    const specialWins = result.wins.filter(w => w.type === 'scatter' || w.type === 'bonus');
    
    specialWins.forEach(win => {
      if (win.freeSpins) {
        this.addFreeSpins(win.freeSpins);
        this.setMultiplier(Math.max(this.multiplier, win.multiplier));
      }
    });
  }
}

export default EgyptSlot;
