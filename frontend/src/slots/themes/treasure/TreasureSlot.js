import SlotMachine from '../../core/SlotMachine';

/**
 * 财富宝藏主题Slots（低门槛高中奖率，适合新手）
 */
class TreasureSlot extends SlotMachine {
  constructor() {
    super({
      reels: 5,
      rows: 3,
      paylines: 20,
      minBet: 10,
      maxBet: 5000, // 最高下注更低，适合新手
      rtp: 0.96 // 回报率更高，中奖率高
    });

    this.symbols = {
      WILD: 'GOLD_COIN', // 金币Wild，出现即奖励
      SCATTER: 'YUANBAO', // 元宝Scatter，2个即可触发免费旋转
      BONUS: 'CAISHEN', // 财神Bonus，红包雨
      GOLD_INGOT: 'GOLD_INGOT', // 金元宝
      AGATE: 'AGATE', // 玛瑙
      JADE: 'JADE', // 翡翠
      PEARL: 'PEARL', // 珍珠
      SILVER: 'SILVER', // 白银
      COPPER: 'COPPER' // 铜钱
    };

    // 各轴符号概率配置（普通符号概率更高，中奖更容易）
    this.reelProbabilities = [
      { GOLD_COIN: 0.05, YUANBAO: 0.05, CAISHEN: 0.03, GOLD_INGOT: 0.15, AGATE: 0.15, JADE: 0.15, PEARL: 0.14, SILVER: 0.14, COPPER: 0.14 },
      { GOLD_COIN: 0.05, YUANBAO: 0.05, CAISHEN: 0.03, GOLD_INGOT: 0.15, AGATE: 0.15, JADE: 0.15, PEARL: 0.14, SILVER: 0.14, COPPER: 0.14 },
      { GOLD_COIN: 0.05, YUANBAO: 0.05, CAISHEN: 0.03, GOLD_INGOT: 0.15, AGATE: 0.15, JADE: 0.15, PEARL: 0.14, SILVER: 0.14, COPPER: 0.14 },
      { GOLD_COIN: 0.05, YUANBAO: 0.05, CAISHEN: 0.03, GOLD_INGOT: 0.15, AGATE: 0.15, JADE: 0.15, PEARL: 0.14, SILVER: 0.14, COPPER: 0.14 },
      { GOLD_COIN: 0.05, YUANBAO: 0.05, CAISHEN: 0.03, GOLD_INGOT: 0.15, AGATE: 0.15, JADE: 0.15, PEARL: 0.14, SILVER: 0.14, COPPER: 0.14 }
    ];

    // 符号倍数配置（门槛低，小奖多）
    this.symbolMultipliers = {
      GOLD_INGOT: { 2: 2, 3: 20, 4: 100, 5: 500 }, // 2个就中奖
      JADE: { 2: 2, 3: 15, 4: 75, 5: 300 },
      AGATE: { 2: 1, 3: 10, 4: 50, 5: 200 },
      PEARL: { 2: 1, 3: 8, 4: 40, 5: 150 },
      SILVER: { 2: 1, 3: 5, 4: 25, 5: 100 },
      COPPER: { 2: 1, 3: 3, 4: 15, 5: 50 }
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

    return 'COPPER'; // 保底
  }

  /**
   * 重写Wild判断
   */
  isWild(symbol) {
    return symbol === this.symbols.WILD;
  }

  /**
   * 重写线奖励计算（2个相同即可中奖，Wild出现即奖励）
   */
  getLineWin(symbols) {
    let firstSymbol = symbols[0];
    let count = 1;

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

    if (count < 2 || !this.symbolMultipliers[firstSymbol]) {
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
    
    // Wild奖励：每个金币Wild直接奖励对应倍数
    const wildCount = allSymbols.filter(s => s === this.symbols.WILD).length;
    if (wildCount > 0) {
      wins.push({
        type: 'wild_bonus',
        count: wildCount,
        reward: this.currentBet * wildCount * 2,
        message: `获得${wildCount}个金币Wild，奖励${wildCount * 2}倍！`
      });
    }

    // Scatter奖励：2个即可触发免费旋转
    const scatterCount = allSymbols.filter(s => s === this.symbols.SCATTER).length;
    if (scatterCount >= 2) {
      const freeSpins = scatterCount * 3;
      wins.push({
        type: 'scatter',
        count: scatterCount,
        reward: this.currentBet * scatterCount * 3,
        freeSpins,
        multiplier: 2,
        message: `恭喜获得${freeSpins}次免费旋转！奖励翻倍！`
      });
    }

    // Bonus奖励：3个以上触发红包雨，最低10倍奖励
    const bonusCount = allSymbols.filter(s => s === this.symbols.BONUS).length;
    if (bonusCount >= 3) {
      const bonusMultiplier = Math.max(bonusCount * 5, 10);
      wins.push({
        type: 'bonus',
        count: bonusCount,
        reward: this.currentBet * bonusMultiplier,
        triggerGame: 'redEnvelopeRain',
        message: `触发财神红包雨！获得${bonusMultiplier}倍奖励！`
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
        this.setMultiplier(Math.max(this.multiplier, win.multiplier || 1));
      }
    });
  }
}

export default TreasureSlot;
