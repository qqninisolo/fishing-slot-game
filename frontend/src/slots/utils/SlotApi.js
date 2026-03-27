/**
 * Slots 后端API对接工具类
 * 负责与后端交互，验证旋转结果、同步奖励、触发小游戏等
 */
class SlotApi {
  constructor() {
    this.baseUrl = '/api/slots';
    this.userId = null;
    this.sessionToken = null;
  }

  /**
   * 初始化用户信息
   * @param {string} userId 用户ID
   * @param {string} sessionToken 会话Token
   */
  init(userId, sessionToken) {
    this.userId = userId;
    this.sessionToken = sessionToken;
  }

  /**
   * 请求后端验证旋转结果（防止客户端作弊）
   * @param {string} theme 主题类型 ocean/egypt/treasure
   * @param {number} bet 下注金额
   * @param {Array} reels 客户端生成的转轮矩阵
   * @returns {Promise} 验证结果
   */
  async validateSpin(theme, bet, reels) {
    if (!this.userId || !this.sessionToken) {
      throw new Error('用户未登录');
    }

    try {
      const response = await fetch(`${this.baseUrl}/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.userId,
          theme,
          bet,
          reels,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '旋转验证失败');
      }

      return result.data;
    } catch (error) {
      console.error('旋转验证失败:', error);
      throw error;
    }
  }

  /**
   * 同步奖励到用户账户
   * @param {string} theme 主题类型
   * @param {number} reward 奖励金额
   * @param {string} rewardType 奖励类型 coin/diamond/item
   * @param {Object} extra 额外信息
   * @returns {Promise} 同步结果
   */
  async syncReward(theme, reward, rewardType = 'coin', extra = {}) {
    if (!this.userId || !this.sessionToken) {
      throw new Error('用户未登录');
    }

    try {
      const response = await fetch(`${this.baseUrl}/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.userId,
          theme,
          reward,
          rewardType,
          extra,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '奖励同步失败');
      }

      return result.data;
    } catch (error) {
      console.error('奖励同步失败:', error);
      throw error;
    }
  }

  /**
   * 触发联动小游戏
   * @param {string} gameType 游戏类型 fishing/treasureHunt/redEnvelopeRain
   * @param {Object} params 游戏参数
   * @returns {Promise} 小游戏启动参数
   */
  async triggerMiniGame(gameType, params = {}) {
    if (!this.userId || !this.sessionToken) {
      throw new Error('用户未登录');
    }

    try {
      const response = await fetch(`${this.baseUrl}/trigger-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.userId,
          gameType,
          params,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '小游戏触发失败');
      }

      return result.data;
    } catch (error) {
      console.error('小游戏触发失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户Slots相关数据
   * @param {string} theme 主题类型（可选，不传则获取所有主题数据）
   * @returns {Promise} 用户数据
   */
  async getUserData(theme = null) {
    if (!this.userId || !this.sessionToken) {
      throw new Error('用户未登录');
    }

    try {
      const url = new URL(`${this.baseUrl}/user-data`);
      if (theme) {
        url.searchParams.append('theme', theme);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '获取用户数据失败');
      }

      return result.data;
    } catch (error) {
      console.error('获取用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 保存用户Slots设置
   * @param {string} theme 主题类型
   * @param {Object} settings 设置内容（自动旋转、音效等）
   * @returns {Promise} 保存结果
   */
  async saveUserSettings(theme, settings) {
    if (!this.userId || !this.sessionToken) {
      throw new Error('用户未登录');
    }

    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.userId,
          theme,
          settings,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '保存设置失败');
      }

      return result.data;
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }
}

// 单例导出
export default new SlotApi();
