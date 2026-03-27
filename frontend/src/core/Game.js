import Cannon from './Cannon.js'
import Fish from './Fish.js'
import Collision from './Collision.js'

export default class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    
    // 游戏状态
    this.isRunning = false
    this.score = 0
    this.gold = 10000 // 初始金币
    
    // 游戏对象
    this.cannon = null
    this.fishes = []
    this.bullets = []
    this.particles = []
    
    // 鱼生成计时器
    this.fishSpawnTimer = 0
    this.fishSpawnInterval = 1000 // 每1秒生成一条鱼
    
    this.init()
  }
  
  init() {
    // 初始化炮台，位置在底部中央
    this.cannon = new Cannon(this.width / 2, this.height - 100, this)
    
    // 绑定触摸/点击事件
    this.bindEvents()
  }
  
  bindEvents() {
    // 点击发射子弹
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // 计算角度，让炮台指向点击位置
      const angle = Math.atan2(y - this.cannon.y, x - this.cannon.x)
      this.cannon.setAngle(angle)
      
      // 发射子弹
      if (this.gold >= this.cannon.cost) {
        this.bullets.push(this.cannon.fire())
        this.gold -= this.cannon.cost
      }
    })
    
    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const angle = Math.atan2(y - this.cannon.y, x - this.cannon.x)
      this.cannon.setAngle(angle)
      
      if (this.gold >= this.cannon.cost) {
        this.bullets.push(this.cannon.fire())
        this.gold -= this.cannon.cost
      }
    })
  }
  
  start() {
    this.isRunning = true
    this.gameLoop()
  }
  
  stop() {
    this.isRunning = false
  }
  
  gameLoop() {
    if (!this.isRunning) return
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    // 更新
    this.update()
    
    // 渲染
    this.render()
    
    requestAnimationFrame(() => this.gameLoop())
  }
  
  update() {
    // 更新炮台
    this.cannon.update()
    
    // 更新子弹
    this.bullets.forEach((bullet, index) => {
      bullet.update()
      // 移除超出画布的子弹
      if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
        this.bullets.splice(index, 1)
      }
    })
    
    // 更新鱼
    this.fishes.forEach((fish, index) => {
      fish.update()
      // 移除超出画布的鱼
      if (fish.x < -100 || fish.x > this.width + 100 || fish.y < -100 || fish.y > this.height + 100) {
        this.fishes.splice(index, 1)
      }
    })
    
    // 生成新鱼
    this.fishSpawnTimer += 16 // 约16ms一帧
    if (this.fishSpawnTimer >= this.fishSpawnInterval) {
      this.spawnFish()
      this.fishSpawnTimer = 0
    }
    
    // 碰撞检测
    this.checkCollisions()
  }
  
  spawnFish() {
    // 随机生成鱼的类型
    const fishTypes = [
      { name: '小金鱼', level: 1, rate: 2, speed: 2, hp: 1, color: '#ffd700', width: 40, height: 25 },
      { name: '小丑鱼', level: 2, rate: 5, speed: 1.8, hp: 2, color: '#ff6b35', width: 50, height: 30 },
      { name: '海龟', level: 3, rate: 10, speed: 1, hp: 5, color: '#8b4513', width: 60, height: 50 },
      { name: '魔鬼鱼', level: 4, rate: 20, speed: 3, hp: 10, color: '#483d8b', width: 70, height: 40 },
      { name: '鲨鱼', level: 5, rate: 50, speed: 1.5, hp: 30, color: '#c0c0c0', width: 120, height: 60 }
    ]
    
    // 随机选择鱼类型，低等级概率更高
    const random = Math.random() * 100
    let selectedType
    if (random < 40) selectedType = fishTypes[0]
    else if (random < 70) selectedType = fishTypes[1]
    else if (random < 85) selectedType = fishTypes[2]
    else if (random < 95) selectedType = fishTypes[3]
    else selectedType = fishTypes[4]
    
    // 随机生成位置，从画布左侧或右侧进入
    const spawnLeft = Math.random() > 0.5
    const x = spawnLeft ? -50 : this.width + 50
    const y = Math.random() * (this.height - 300) + 100 // 避开底部炮台区域
    
    // 移动角度，朝向画布另一侧
    const angle = spawnLeft ? Math.random() * Math.PI/3 - Math.PI/6 : Math.PI + Math.random() * Math.PI/3 - Math.PI/6
    
    this.fishes.push(new Fish(x, y, angle, selectedType, this))
  }
  
  checkCollisions() {
    // 检测每颗子弹和每条鱼的碰撞
    this.bullets.forEach((bullet, bulletIndex) => {
      this.fishes.forEach((fish, fishIndex) => {
        if (Collision.checkCircleCollision(bullet, fish)) {
          // 命中，鱼减少血量
          fish.hp -= bullet.damage
          
          // 移除子弹
          this.bullets.splice(bulletIndex, 1)
          
          // 鱼死亡
          if (fish.hp <= 0) {
            this.score += fish.rate * 10
            this.gold += fish.rate * this.cannon.level
            this.fishes.splice(fishIndex, 1)
            
            // TODO: 播放死亡动画、音效
          }
          
          // TODO: 播放命中特效
        }
      })
    })
  }
  
  render() {
    // 渲染背景（简单渐变）
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    // 渲染鱼
    this.fishes.forEach(fish => fish.render(this.ctx))
    
    // 渲染子弹
    this.bullets.forEach(bullet => bullet.render(this.ctx))
    
    // 渲染炮台
    this.cannon.render(this.ctx)
    
    // 渲染UI信息
    this.renderUI()
  }
  
  renderUI() {
    // 金币
    this.ctx.fillStyle = '#ffd700'
    this.ctx.font = 'bold 24px Arial'
    this.ctx.fillText(`金币: ${this.gold}`, 20, 40)
    
    // 分数
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '20px Arial'
    this.ctx.fillText(`分数: ${this.score}`, 20, 70)
    
    // 炮台等级
    this.ctx.fillStyle = '#00ff00'
    this.ctx.font = '20px Arial'
    this.ctx.fillText(`炮台等级: ${this.cannon.level}`, this.width - 180, 40)
  }
}
