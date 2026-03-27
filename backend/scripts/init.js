const dotenv = require('dotenv');
const connectDB = require('../src/config/db');
const Fish = require('../src/models/Fish');
const Turret = require('../src/models/Turret');

dotenv.config();

const initData = async () => {
  try {
    await connectDB();
    console.log('开始初始化数据...');
    
    // 初始化鱼类数据
    await Fish.initDefaultFish();
    // 初始化炮台数据
    await Turret.initDefaultTurrets();
    
    console.log('所有数据初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化数据失败:', error);
    process.exit(1);
  }
};

initData();
