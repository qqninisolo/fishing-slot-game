import Game from './core/Game.js'

// 初始化游戏
const canvas = document.getElementById('gameCanvas')
const game = new Game(canvas)

// 启动游戏
game.start()
