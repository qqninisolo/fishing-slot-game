import SlotMachine from '../../core/SlotMachine';

/**
 * 海洋主题Slots（与捕鱼游戏联动）
 */
class OceanSlot extends SlotMachine {
  constructor() {
    super({
      reels: 5,
      rows: 3,
      paylines: 20,
      minBet: 10,
      maxBet: 10000,
      rtp: 0.94
    });

    this.symbols = {
      WILD: 'WILD', //  wild符号
      SCATTER: 'SCATTER', // 贝壳符号
      BONUS: 'BONUS', // 宝箱符号
      FISH: 'FISH', // 鱼
      STARFISH: 'STARFISH', // 海星
      SHELL: 'SHELL', // 贝壳
      CORAL: 'CORAL', // 珊瑚
      PEARL: 'PEARL', // 珍珠
      DOLPHIN: 'DOLPHIN' // 海豚
    };

    // 各轴符号概率配置
    this.reelProbabilities = [
      // 第1轴
      { WILD: 0.02, SCATTER: 0.03, BONUS: 0.02, FISH: 0.15, STARFISH: 0.15, SHELL: 0.15, CORAL: 0.16, PEARL: 0.16, DOLPHIN: 0.16 },
      // 第2轴
      { WILD: 0.02, SCATTER: 0.03, BONUS: 0.02, FISH: 0.15, STARFISH: 0.15, SHELL: 0.15, CORAL: 0.16, PEARL: 0.16, DOLPHIN: 0.16 },
      // 第3轴
      { WILD: 0.02, SCATTER: 0.03, BONUS: 0.02, FISH: 0.15, STARFISH: 0.15, SHELL: 0.15, CORAL: 0.16, PEARL: 0.16, DOLPHIN: 0.16 },
      // 第4轴
      { WILD: 0.02, SCATTER: 0.03, BONUS: 0.02, FISH: 0.15, STARFISH: 0.15, SHELL: 0.15, CORAL: 0.16, PEARL: 0.16, DOLPHIN: 0.16 },
      // 第5轴
      { WILD: 0.02, SCATTER: 0.03, BONUS: 0.02, FISH: 0.15, STARFISH: 0.15, SHELL: 0.15, CORAL: 0.16, PEARL: 0.16, DOLPHIN: 0.16 }
    ];

    // 符号倍数配置
    this.symbolMultipliers = {
      DOLPHIN: { 3: 20, 4: 100, 5: 500 },
      PEARL: { 3: 15, 4: 75, 5: 300 },
      CORAL: { 3: 10, 4: 50, 5: 200 },
      SHELL: { 3: 8, 4: 40, 5: 150 },
      STARFISH: { 3: 5, 4: 25, 5: 100 },
      FISH: { 3: 3, 4: 15, 5: 50 }
    };
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

    return 'FISH'; // 保底
  }

  /**
   * 重写Wild判断
   */
  isWild(symbol) {
    return symbol === this.symbols.WILD;
  }

  /**
   * 重写线奖励计算
   */
  getLineWin(symbols) {
    let firstSymbol = symbols[0];
    let count = 1;
    let hasWild = false;

    // 处理Wild替代
    for (let i = 0; i < symbols.length; i++) {
      if (this.isWild(symbols[i])) {
        hasWild = true;
        if (i === 0) {
          // 第一个是Wild，找后面第一个非Wild作为基准符号
          for (let j = 1; j < symbols.length; j++) {
            if (!this.isWild(symbols[j])) {
              firstSymbol = symbols[j];
              break;
            }
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

    return {
      multiplier: this.symbolMultipliers[firstSymbol][count] || 0,
      symbolType: firstSymbol
    };
  }

  /**
   * 重写特殊奖励计算
   */
  calculateSpecialWins() {
    const wins = [];
    const allSymbols = this.reels.flat();
    
    // Scatter奖励：3个以上触发15次免费旋转，奖励翻倍
    const scatterCount = allSymbols.filter(s => s === this.symbols.SCATTER).length;
    if (scatterCount >= 3) {
      wins.push({
        type: 'scatter',
        count: scatterCount,
        reward: this.currentBet * scatterCount * 2,
        multiplier: 2,
        freeSpins: 15,
        message: '恭喜获得15次免费旋转！奖励翻倍！'
      });
    }

    // Bonus奖励：3个以上触发捕鱼小游戏
    const bonusCount = allSymbols.filter(s => s === this.symbols.BONUS).length;
    if (bonusCount >= 3) {
      wins.push({
        type: 'bonus',
        count: bonusCount,
        reward: this.currentBet * bonusCount * 5,
        triggerGame: 'fishing',
        message: '触发捕鱼小游戏！奖励已发送到捕鱼账户！'
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
        this.setMultiplier(win.multiplier);
      }
    });
  }
}

export default OceanSlot;
