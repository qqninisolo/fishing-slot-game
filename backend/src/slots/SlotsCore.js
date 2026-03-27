/**
 * Slots核心逻辑通用类
 * 5轴3行，20条支付线
 */
class SlotsCore {
  constructor(config) {
    this.reels = config.reels; // 每个轴的符号列表
    this.paylines = config.paylines; // 支付线配置
    this.payoutTable = config.payoutTable; // 赔付表
    this.wildSymbol = config.wildSymbol; // Wild符号
    this.scatterSymbol = config.scatterSymbol; // Scatter符号
    this.bonusSymbol = config.bonusSymbol; // Bonus符号
    this.rtp = config.rtp || 0.94; // 玩家回报率94%
  }

  // 生成随机旋转结果
  spin(betAmount) {
    const result = [];
    // 每个轴随机取3个符号
    for (let i = 0; i < 5; i++) {
      const reel = this.reels[i];
      const randomPos = Math.floor(Math.random() * reel.length);
      // 取当前位置和上下位置的符号（环形）
      const symbols = [
        reel[(randomPos - 1 + reel.length) % reel.length],
        reel[randomPos],
        reel[(randomPos + 1) % reel.length]
      ];
      result.push(symbols);
    }

    // 计算奖励
    const { winAmount, paylineWins, scatterWins, bonusWins } = this.calculateWin(result, betAmount);
    
    // RTP调整（简单实现，后续可优化为更复杂的动态调整）
    const adjustedWinAmount = this.adjustWinByRTP(winAmount, betAmount);

    return {
      reels: result,
      winAmount: adjustedWinAmount,
      paylineWins,
      scatterWins,
      bonusWins,
      hasFreeSpin: this.checkFreeSpin(result),
      hasBonusGame: this.checkBonusGame(result)
    };
  }

  // 计算中奖金额
  calculateWin(reelsResult, betAmount) {
    let totalWin = 0;
    const paylineWins = [];
    let scatterWins = 0;
    let bonusWins = 0;

    // 计算支付线中奖
    for (let i = 0; i < this.paylines.length; i++) {
      const payline = this.paylines[i];
      const symbols = payline.map((row, reelIndex) => reelsResult[reelIndex][row]);
      
      // 检查连续相同符号（从左到右）
      const matchCount = this.getMatchCount(symbols);
      if (matchCount >= 3) {
        const symbol = symbols[0] === this.wildSymbol ? symbols[1] || symbols[0] : symbols[0];
        const payout = this.payoutTable[symbol]?.[matchCount - 3] || 0;
        const win = payout * betAmount;
        if (win > 0) {
          paylineWins.push({
            payline: i + 1,
            symbols,
            matchCount,
            win
          });
          totalWin += win;
        }
      }
    }

    // 计算Scatter中奖
    const scatterCount = this.countSymbol(reelsResult, this.scatterSymbol);
    if (scatterCount >= 3) {
      scatterWins = this.getScatterPayout(scatterCount) * betAmount;
      totalWin += scatterWins;
    }

    // 计算Bonus中奖
    const bonusCount = this.countSymbol(reelsResult, this.bonusSymbol);
    if (bonusCount >= 3) {
      bonusWins = this.getBonusPayout(bonusCount) * betAmount;
      totalWin += bonusWins;
    }

    return {
      winAmount: totalWin,
      paylineWins,
      scatterWins,
      bonusWins
    };
  }

  // 获取连续匹配数量
  getMatchCount(symbols) {
    let count = 1;
    let firstSymbol = symbols[0];
    // 处理Wild替代
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol || symbols[i] === this.wildSymbol || firstSymbol === this.wildSymbol) {
        count++;
        if (firstSymbol === this.wildSymbol && symbols[i] !== this.wildSymbol) {
          firstSymbol = symbols[i];
        }
      } else {
        break;
      }
    }
    return count;
  }

  // 统计符号出现次数
  countSymbol(reelsResult, symbol) {
    let count = 0;
    for (let reel of reelsResult) {
      for (let s of reel) {
        if (s === symbol) count++;
      }
    }
    return count;
  }

  // 检查是否触发免费旋转（子类可重写）
  checkFreeSpin(reelsResult) {
    const scatterCount = this.countSymbol(reelsResult, this.scatterSymbol);
    return scatterCount >= 3;
  }

  // 检查是否触发Bonus游戏（子类可重写）
  checkBonusGame(reelsResult) {
    const bonusCount = this.countSymbol(reelsResult, this.bonusSymbol);
    return bonusCount >= 3;
  }

  // 获取Scatter赔付（子类可重写）
  getScatterPayout(count) {
    const payouts = [0, 0, 0, 2, 5, 10];
    return payouts[count] || 0;
  }

  // 获取Bonus赔付（子类可重写）
  getBonusPayout(count) {
    const payouts = [0, 0, 0, 5, 10, 20];
    return payouts[count] || 0;
  }

  // RTP调整
  adjustWinByRTP(winAmount, betAmount) {
    const random = Math.random();
    if (random > this.rtp) {
      return Math.floor(winAmount * 0.5);
    }
    return winAmount;
  }
}

module.exports = SlotsCore;
