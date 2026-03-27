const express = require('express');
const router = express.Router();
const OceanSlots = require('../slots/OceanSlots');
const EgyptSlots = require('../slots/EgyptSlots');
const WealthSlots = require('../slots/WealthSlots');

// 初始化3款Slots实例
const slotsInstances = {
  ocean: new OceanSlots(),
  egypt: new EgyptSlots(),
  wealth: new WealthSlots()
};

/**
 * 旋转Slots接口
 * POST /api/slots/spin
 * 参数：
 *   type: string -  Slots类型：ocean/egypt/wealth
 *   betAmount: number - 下注金额
 *   userId: string - 用户ID
 */
router.post('/spin', (req, res) => {
  try {
    const { type, betAmount, userId } = req.body;

    // 参数校验
    if (!slotsInstances[type]) {
      return res.status(400).json({ code: 400, message: '无效的Slots类型' });
    }
    if (!betAmount || betAmount < 10 || betAmount > 10000) {
      return res.status(400).json({ code: 400, message: '下注金额必须在10-10000之间' });
    }
    if (!userId) {
      return res.status(400).json({ code: 400, message: '用户ID不能为空' });
    }

    // 执行旋转
    const slots = slotsInstances[type];
    const result = slots.spin(betAmount);

    // TODO：后续对接经济系统，扣除用户下注金额，发放奖励
    // 临时返回结果，后续完善

    res.json({
      code: 200,
      message: 'success',
      data: {
        type,
        betAmount,
        ...result
      }
    });
  } catch (error) {
    console.error('Slots旋转错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 获取Slots配置接口
 * GET /api/slots/config/:type
 */
router.get('/config/:type', (req, res) => {
  try {
    const { type } = req.params;
    if (!slotsInstances[type]) {
      return res.status(400).json({ code: 400, message: '无效的Slots类型' });
    }

    const slots = slotsInstances[type];
    res.json({
      code: 200,
      message: 'success',
      data: {
        paylines: slots.paylines,
        payoutTable: slots.payoutTable,
        wildSymbol: slots.wildSymbol,
        scatterSymbol: slots.scatterSymbol,
        bonusSymbol: slots.bonusSymbol
      }
    });
  } catch (error) {
    console.error('获取Slots配置错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
