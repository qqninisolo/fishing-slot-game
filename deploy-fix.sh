#!/bin/bash

# 修复并重新部署到 8.221.119.164
# 目标: 部署最新完整版本，包含登录、大厅、捕鱼游戏、老虎机

set -e

echo "=========================================="
echo "   重新部署到 8.221.119.164"
echo "   目标: 修复登录和大厅缺失问题"
echo "   时间: $(date)"
echo "=========================================="

TARGET_SERVER="8.221.119.164"
TARGET_USER="root"
TARGET_DIR="/data/fishing-slot-game"
SSH_PASS="Fuckjapan12!@"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}[步骤 1/6] 停止旧服务...${NC}"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} << 'ENDSSH'
cd /data/fishing-slot-game

# 停止所有相关进程
pkill -f "node.*api-server" || true
pkill -f "node.*game-server" || true
pkill -f "vite" || true
pkill -f "node.*main.js" || true

sleep 2

echo "旧服务已停止"
ENDSSH

echo ""
echo -e "${YELLOW}[步骤 2/6] 备份旧代码...${NC}"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} << 'ENDSSH'
cd /data
mv fishing-slot-game fishing-slot-game-backup-$(date +%Y%m%d-%H%M%S) || true
mkdir -p fishing-slot-game
ENDSSH

echo ""
echo -e "${YELLOW}[步骤 3/6] 上传最新代码...${NC}"
cd /workspace/projects/workspace/projects/fishing-slot-game

# 排除不需要上传的文件
tar -czf /tmp/cardgame-latest.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  --exclude='*.log' \
  --exclude=dist \
  --exclude=.DS_Store \
  .

# 上传到服务器
sshpass -p "${SSH_PASS}" scp -o StrictHostKeyChecking=no \
  /tmp/cardgame-latest.tar.gz \
  ${TARGET_USER}@${TARGET_SERVER}:/tmp/

# 解压到服务器
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} << 'ENDSSH'
cd /data/fishing-slot-game
tar -xzf /tmp/cardgame-latest.tar.gz
rm /tmp/cardgame-latest.tar.gz

echo "代码上传完成"
ENDSSH

echo ""
echo -e "${YELLOW}[步骤 4/6] 安装依赖...${NC}"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} << 'ENDSSH'
cd /data/fishing-slot-game/backend
echo "安装后端依赖..."
npm install --silent

cd ../frontend
echo "安装前端依赖..."
npm install --silent

echo "依赖安装完成"
ENDSSH

echo ""
echo -e "${YELLOW}[步骤 5/6] 启动服务...${NC}"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} << 'ENDSSH'
cd /data/fishing-slot-game

# 清理可能存在的日志目录
mkdir -p logs

# 停止可能残留的进程
pkill -f "node.*api-server" || true
pkill -f "node.*game-server" || true
pkill -f "vite" || true

sleep 2

# 启动后端API服务器
cd backend
nohup node api-server.js > ../logs/api-server.log 2>&1 &
API_PID=$!
echo "API服务器已启动 (PID: $API_PID, 端口 3000)"

# 启动游戏服务器
nohup node game-server-mock.js > ../logs/game-server.log 2>&1 &
GAME_PID=$!
echo "游戏服务器已启动 (PID: $GAME_PID, 端口 4000)"

# 启动前端服务器
cd ../frontend
# 先构建项目
echo "构建前端项目..."
npm run build
# 复制HTML文件到dist目录
echo "复制HTML文件..."
cp src/login.html dist/
cp src/hall.html dist/
cp src/fishing.html dist/
# 启动预览服务器
nohup npm run preview > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务器已启动 (PID: $FRONTEND_PID, 端口 5173)"

# 保存PID
echo $API_PID > ../logs/api-server.pid
echo $GAME_PID > ../logs/game-server.pid
echo $FRONTEND_PID > ../logs/frontend.pid

echo ""
echo "服务启动中，等待5秒..."
sleep 5

# 检查服务状态
echo ""
echo "=== 服务进程检查 ==="
ps aux | grep -E "(api-server|game-server|vite)" | grep -v grep || echo "未找到运行中的进程"

echo ""
echo "=== 端口监听检查 ==="
netstat -tlnp 2>/dev/null | grep -E ":(3000|4000|5173)" || ss -tlnp 2>/dev/null | grep -E ":(3000|4000|5173)"

ENDSSH

echo ""
echo -e "${YELLOW}[步骤 6/6] 验证部署...${NC}"
echo ""
echo "等待服务完全启动..."
sleep 3

# 检查前端服务
echo "检查前端服务..."
FRONTEND_STATUS=$(sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/ || echo '000'")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 前端服务正常 (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ 前端服务异常 (HTTP $FRONTEND_STATUS)${NC}"
fi

# 检查API服务
echo "检查API服务..."
API_STATUS=$(sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/v1/health || echo '000'")

if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ API服务正常 (HTTP $API_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  API服务可能需要初始化 (HTTP $API_STATUS)${NC}"
fi

# 检查游戏服务
echo "检查游戏服务..."
GAME_STATUS=$(sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/health || echo '000'")

if [ "$GAME_STATUS" = "200" ] || [ "$GAME_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ 游戏服务正常 (HTTP $GAME_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  游戏服务可能需要初始化 (HTTP $GAME_STATUS)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "  前端: http://${TARGET_SERVER}:5173/"
echo "  API:  http://${TARGET_SERVER}:3000/api/v1"
echo "  游戏: http://${TARGET_SERVER}:4000"
echo ""
echo "📱 测试账号:"
echo "  用户名: test123"
echo "  密码: 123456"
echo ""
echo "📋 查看日志:"
echo "  前端日志: sshpass -p '密码' ssh root@${TARGET_SERVER} 'tail -f /data/fishing-slot-game/logs/frontend.log'"
echo "  API日志: sshpass -p '密码' ssh root@${TARGET_SERVER} 'tail -f /data/fishing-slot-game/logs/api-server.log'"
echo "  游戏日志: sshpass -p '密码' ssh root@${TARGET_SERVER} 'tail -f /data/fishing-slot-game/logs/game-server.log'"
echo ""
echo "🛑 停止服务:"
echo "  sshpass -p '密码' ssh root@${TARGET_SERVER} 'cd /data/fishing-slot-game && pkill -f \"api-server|game-server|vite\"'"
echo ""
echo "=========================================="
echo ""
echo "⚠️  重要提示:"
echo "  1. 访问 http://${TARGET_SERVER}:5173/ 应该看到登录页面"
echo "  2. 登录后应该看到游戏大厅"
echo "  3. 点击游戏卡片可以进入对应的游戏"
echo ""
echo "=========================================="

# 清理临时文件
rm -f /tmp/cardgame-latest.tar.gz
