<template>
  <div class="slots-demo">
    <h1>《欢乐渔乐城》Slots Demo</h1>
    
    <!-- 主题选择 -->
    <div class="theme-selector">
      <button 
        v-for="theme in themes" 
        :key="theme.id"
        @click="selectTheme(theme.id)"
        :class="{ active: currentTheme === theme.id }"
      >
        {{ theme.name }}
      </button>
    </div>

    <!-- 游戏信息 -->
    <div class="game-info">
      <p>当前下注: <input type="number" v-model="bet" :min="minBet" :max="maxBet" @change="setBet"></p>
      <p>免费旋转剩余: {{ freeSpins }}</p>
      <p>当前乘数: {{ multiplier }}x</p>
      <p>上次奖励: {{ lastWin }} 金币</p>
    </div>

    <!-- 转轮显示 -->
    <div class="reels-container">
      <div class="reel" v-for="(reel, reelIndex) in reels" :key="reelIndex">
        <div class="symbol" v-for="(symbol, rowIndex) in reel" :key="rowIndex">
          {{ symbol }}
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="controls">
      <button @click="spin" :disabled="spinning" class="spin-btn">
        {{ spinning ? '旋转中...' : freeSpins > 0 ? '免费旋转' : '旋转' }}
      </button>
      <button @click="reset">重置</button>
    </div>

    <!-- 中奖信息 -->
    <div class="win-info" v-if="wins.length > 0">
      <h3>本次中奖:</h3>
      <ul>
        <li v-for="(win, index) in wins" :key="index">
          {{ win.message || `${win.symbolType} 匹配${win.symbols.length}个，奖励 ${win.reward} 金币` }}
        </li>
      </ul>
      <p class="total-win">总奖励: {{ totalWin }} 金币</p>
    </div>
  </div>
</template>

<script>
import OceanSlot from '../themes/ocean/OceanSlot';
import EgyptSlot from '../themes/egypt/EgyptSlot';
import TreasureSlot from '../themes/treasure/TreasureSlot';

export default {
  name: 'SlotsDemo',
  data() {
    return {
      themes: [
        { id: 'ocean', name: '海洋主题', class: OceanSlot },
        { id: 'egypt', name: '古埃及主题', class: EgyptSlot },
        { id: 'treasure', name: '财富宝藏主题', class: TreasureSlot }
      ],
      currentTheme: 'ocean',
      slotMachine: null,
      reels: [],
      bet: 10,
      minBet: 10,
      maxBet: 10000,
      freeSpins: 0,
      multiplier: 1,
      spinning: false,
      wins: [],
      totalWin: 0,
      lastWin: 0
    };
  },
  mounted() {
    this.initSlotMachine();
  },
  methods: {
    initSlotMachine() {
      const theme = this.themes.find(t => t.id === this.currentTheme);
      this.slotMachine = new theme.class();
      this.minBet = this.slotMachine.config.minBet;
      this.maxBet = this.slotMachine.config.maxBet;
      this.bet = Math.max(this.minBet, Math.min(this.bet, this.maxBet));
      this.slotMachine.setBet(this.bet);
      this.updateGameInfo();
      this.reels = this.slotMachine.generateReels();
    },
    selectTheme(themeId) {
      this.currentTheme = themeId;
      this.initSlotMachine();
      this.wins = [];
      this.totalWin = 0;
      this.lastWin = 0;
    },
    setBet() {
      try {
        this.slotMachine.setBet(this.bet);
      } catch (e) {
        alert(e.message);
        this.bet = this.slotMachine.currentBet;
      }
    },
    spin() {
      if (this.spinning) return;
      
      this.spinning = true;
      this.wins = [];
      this.totalWin = 0;

      // 模拟旋转动画
      let spinCount = 0;
      const spinInterval = setInterval(() => {
        this.reels = this.slotMachine.generateReels();
        spinCount++;
        
        if (spinCount >= 10) {
          clearInterval(spinInterval);
          this.finalizeSpin();
        }
      }, 100);
    },
    finalizeSpin() {
      const result = this.slotMachine.spin();
      this.reels = result.reels;
      this.wins = result.wins;
      this.totalWin = result.totalWin;
      this.lastWin = result.totalWin;
      this.updateGameInfo();
      this.spinning = false;
    },
    updateGameInfo() {
      this.freeSpins = this.slotMachine.freeSpins;
      this.multiplier = this.slotMachine.multiplier;
    },
    reset() {
      this.initSlotMachine();
      this.wins = [];
      this.totalWin = 0;
      this.lastWin = 0;
    }
  }
};
</script>

<style scoped>
.slots-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.theme-selector {
  margin-bottom: 20px;
}

.theme-selector button {
  padding: 10px 20px;
  margin: 0 5px;
  font-size: 16px;
  cursor: pointer;
  border: 2px solid #ccc;
  border-radius: 5px;
  background: #fff;
}

.theme-selector button.active {
  background: #4CAF50;
  color: white;
  border-color: #45a049;
}

.game-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
}

.game-info input {
  width: 80px;
  padding: 5px;
  text-align: center;
}

.reels-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #2c3e50;
  border-radius: 10px;
}

.reel {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100px;
}

.symbol {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 5px;
}

.controls {
  margin-bottom: 20px;
}

.spin-btn {
  padding: 15px 40px;
  font-size: 20px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.spin-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.controls button {
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}

.win-info {
  padding: 15px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 5px;
  text-align: left;
}

.win-info ul {
  list-style: none;
  padding: 0;
}

.win-info li {
  margin: 5px 0;
  padding: 5px;
  background: #fff;
  border-radius: 3px;
}

.total-win {
  font-size: 20px;
  font-weight: bold;
  color: #d63384;
  margin-top: 10px;
}
</style>
