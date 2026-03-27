const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * 扣除金币
 * POST /api/economy/coins/deduct
 * 参数：
 *   userId: string
 *   amount: number
 *   reason: string
 */
router.post('/coins/deduct', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ code: 400, message: '扣除金额必须大于0' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    if (user.coins < amount) {
      return res.status(400).json({ code: 400, message: '金币不足' });
    }

    user.coins -= amount;
    user.totalBet += amount;
    await user.save();

    res.json({
      code: 200,
      message: '扣除成功',
      data: {
        coins: user.coins,
        deducted: amount
      }
    });
  } catch (error) {
    console.error('扣除金币错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 增加金币
 * POST /api/economy/coins/add
 * 参数：
 *   userId: string
 *   amount: number
 *   reason: string
 */
router.post('/coins/add', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ code: 400, message: '增加金额必须大于0' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    // 每日产出上限控制
    const today = new Date().toDateString();
    const lastLoginDate = new Date(user.lastLoginDate).toDateString();
    if (today !== lastLoginDate) {
      user.dailyPlayTime = 0;
      user.lastLoginDate = new Date();
    }

    const maxDailyCoins = user.userType === 'vip' ? 10000000 : 1000000;
    if (user.dailyPlayTime + amount > maxDailyCoins) {
      return res.status(400).json({ code: 400, message: '今日金币产出已达上限' });
    }

    user.coins += amount;
    user.totalWin += amount;
    user.dailyPlayTime += amount;
    await user.save();

    res.json({
      code: 200,
      message: '增加成功',
      data: {
        coins: user.coins,
        added: amount
      }
    });
  } catch (error) {
    console.error('增加金币错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 获取用户经济信息
 * GET /api/economy/balance/:userId
 */
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        coins: user.coins,
        diamonds: user.diamonds,
        items: user.items
      }
    });
  } catch (error) {
    console.error('获取余额错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
