/**
 * Slots 核心逻辑通用类
 * 3款Slots主题继承此类实现各自特殊规则
 */
class SlotMachine {
  constructor(config) {
    this.config = {
      reels: 5,
      rows: 3,
      paylines: 20,
      minBet: 10,
      maxBet: 10000,
      rtp: 0.94, // 默认94%回报率
      ...config
    };
    
    this.currentBet = this.config.minBet;
    this.reels = [];
    this.lastResult = null;
    this.freeSpins = 0;
    this.multiplier = 1;
  }

  /**
   * 设置下注金额
   * @param {number} bet 下注金额
   */
  setBet(bet) {
    if (bet < this.config.minBet || bet > this.config.maxBet) {
      throw new Error(`下注金额必须在${this.config.minBet}到${this.config.maxBet}之间`);
    }
    this.currentBet = bet;
  }

  /**
   * 生成随机转轮结果
   * @returns {Array} 转轮矩阵 [5轴][3行]
   */
  generateReels() {
    const reels = [];
    for (let i = 0; i < this.config.reels; i++) {
      const reel = [];
      for (let j = 0; j < this.config.rows; j++) {
        reel.push(this.getRandomSymbol(i));
      }
      reels.push(reel);
    }
    this.reels = reels;
    return reels;
  }

  /**
   * 获取随机符号（子类重写实现不同主题的符号概率）
   * @param {number} reelIndex 轴索引
   * @returns {string} 符号
   */
  getRandomSymbol(reelIndex) {
    const symbols = ['A', 'K', 'Q', 'J', '10', '9'];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  /**
   * 判定中奖线
   * @returns {Array} 中奖线列表，包含线索引、符号、奖励倍数
   */
  calculateWins() {
    const wins = [];
    const paylines = this.getPaylines();

    paylines.forEach((payline, lineIndex) => {
      const symbols = payline.map(([reel, row]) => this.reels[reel][row]);
      const winInfo = this.getLineWin(symbols);
      
      if (winInfo.multiplier > 0) {
        wins.push({
          lineIndex,
          symbols,
          multiplier: winInfo.multiplier,
          reward: this.currentBet * winInfo.multiplier * this.multiplier,
          symbolType: winInfo.symbolType
        });
      }
    });

    // 检查特殊符号奖励（Scatter、Bonus等）
    const specialWins = this.calculateSpecialWins();
    wins.push(...specialWins);

    return wins;
  }

  /**
   * 获取支付线配置（默认20条标准支付线）
   * @returns {Array} 支付线坐标
   */
  getPaylines() {
    return [
      [[0,1], [1,1], [2,1], [3,1], [4,1]], // 1: 中间水平线
      [[0,0], [1,0], [2,0], [3,0], [4,0]], // 2: 顶部水平线
      [[0,2], [1,2], [2,2], [3,2], [4,2]], // 3: 底部水平线
      [[0,0], [1,1], [2,2], [3,1], [4,0]], // 4: V型
      [[0,2], [1,1], [2,0], [3,1], [4,2]], // 5: 倒V型
      [[0,0], [1,0], [2,1], [3,2], [4,2]], // 6: 下斜
      [[0,2], [1,2], [2,1], [3,0], [4,0]], // 7: 上斜
      [[0,1], [1,0], [2,0], [3,0], [4,1]], // 8: 上凹
      [[0,1], [1,2], [2,2], [3,2], [4,1]], // 9: 下凹
      [[0,0], [1,1], [2,1], [3,1], [4,0]], // 10: 上拱
      [[0,2], [1,1], [2,1], [3,1], [4,2]], // 11: 下拱
      [[0,0], [1,0], [2,1], [3,0], [4,0]], // 12: W型上
      [[0,2], [1,2], [2,1], [3,2], [4,2]], // 13: W型下
      [[0,1], [1,0], [2,1], [3,0], [4,1]], // 14: 锯齿上
      [[0,1], [1,2], [2,1], [3,2], [4,1]], // 15: 锯齿下
      [[0,0], [1,1], [2,0], [3,1], [4,0]], // 16: 闪电上
      [[0,2], [1,1], [2,2], [3,1], [4,2]], // 17: 闪电下
      [[0,0], [1,2], [2,0], [3,2], [4,0]], // 18: 交错上
      [[0,2], [1,0], [2,2], [3,0], [4,2]], // 19: 交错下
      [[0,1], [1,1], [2,0], [3,1], [4,1]]  // 20: 中线上凸
    ];
  }

  /**
   * 计算单条支付线的奖励（子类重写实现不同符号的倍数）
   * @param {Array} symbols 线上的符号列表
   * @returns {Object} 奖励信息 { multiplier, symbolType }
   */
  getLineWin(symbols) {
    const firstSymbol = symbols[0];
    let count = 1;

    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol || this.isWild(symbols[i])) {
        count++;
      } else {
        break;
      }
    }

    if (count < 3) return { multiplier: 0, symbolType: null };

    // 默认倍数
    const multipliers = { 3: 5, 4: 25, 5: 100 };
    return {
      multiplier: multipliers[count] || 0,
      symbolType: firstSymbol
    };
  }

  /**
   * 判断是否是Wild符号（子类重写）
   * @param {string} symbol 符号
   * @returns {boolean}
   */
  isWild(symbol) {
    return symbol === 'WILD';
  }

  /**
   * 计算特殊符号奖励（Scatter、Bonus等，子类重写）
   * @returns {Array} 特殊奖励列表
   */
  calculateSpecialWins() {
    return [];
  }

  /**
   * 旋转主逻辑
   * @returns {Object} 旋转结果
   */
  spin() {
    if (this.freeSpins > 0) {
      this.freeSpins--;
    }

    const reels = this.generateReels();
    const wins = this.calculateWins();
    const totalWin = wins.reduce((sum, win) => sum + win.reward, 0);

    this.lastResult = {
      reels,
      wins,
      totalWin,
      bet: this.currentBet,
      freeSpinsRemaining: this.freeSpins,
      multiplier: this.multiplier,
      timestamp: Date.now()
    };

    // 触发特殊规则
    this.handleSpecialRules(this.lastResult);

    return this.lastResult;
  }

  /**
   * 处理特殊规则（子类重写）
   * @param {Object} result 旋转结果
   */
  handleSpecialRules(result) {
    // 子类实现特殊逻辑，比如免费旋转、小游戏触发等
  }

  /**
   * 添加免费旋转次数
   * @param {number} count 次数
   */
  addFreeSpins(count) {
    this.freeSpins += count;
  }

  /**
   * 设置乘数
   * @param {number} multiplier 乘数
   */
  setMultiplier(multiplier) {
    this.multiplier = multiplier;
  }
}

export default SlotMachine;
