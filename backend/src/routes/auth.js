const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

/**
 * 游客登录
 * POST /api/auth/guest/login
 */
router.post('/guest/login', async (req, res) => {
  try {
    // 生成唯一用户ID
    const userId = 'guest_' + crypto.randomBytes(16).toString('hex');
    
    // 创建新游客用户
    const user = new User({
      userId,
      username: `游客${Math.floor(Math.random() * 1000000)}`,
      userType: 'guest'
    });

    await user.save();

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        diamonds: user.diamonds,
        level: user.level,
        vipLevel: user.vipLevel,
        token: crypto.randomBytes(32).toString('hex') // 临时token，后续完善JWT
      }
    });
  } catch (error) {
    console.error('游客登录错误:', error);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

/**
 * 获取用户信息
 * GET /api/auth/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
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
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        userType: user.userType,
        coins: user.coins,
        diamonds: user.diamonds,
        items: user.items,
        level: user.level,
        exp: user.exp,
        vipLevel: user.vipLevel,
        totalWin: user.totalWin,
        totalBet: user.totalBet,
        fishCaught: user.fishCaught,
        slotsSpins: user.slotsSpins
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
