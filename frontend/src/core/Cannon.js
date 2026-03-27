export default class Cannon {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
    this.level = 1 // 初始等级1级
    this.angle = -Math.PI / 2 // 默认朝上
    this.width = 80
    this.height = 100
    this.damage = 1 // 基础伤害
    this.cost = 10 // 每次发射消耗的金币
    
    // 炮管参数
    this.barrelLength = 60
    this.barrelWidth = 15
  }
  
  setAngle(angle) {
    // 限制角度范围，只能朝上
    if (angle > -Math.PI && angle < 0) {
      this.angle = angle
    }
  }
  
  levelUp() {
    if (this.level < 100) {
      this.level++
      this.damage = this.level
      this.cost = 10 * this.level
    }
  }
  
  levelDown() {
    if (this.level > 1) {
      this.level--
      this.damage = this.level
      this.cost = 10 * this.level
    }
  }
  
  fire() {
    // 计算子弹初始位置（炮口位置）
    const bulletX = this.x + Math.cos(this.angle) * this.barrelLength
    const bulletY = this.y + Math.sin(this.angle) * this.barrelLength
    
    return new Bullet(bulletX, bulletY, this.angle, this.damage, this.game)
  }
  
  update() {
    // 炮台逻辑更新
  }
  
  render(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    
    // 绘制炮台底座
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(0, 0, 40, 0, Math.PI * 2)
    ctx.fill()
    
    // 底座高光
    ctx.fillStyle = '#555'
    ctx.beginPath()
    ctx.arc(0, -10, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // 绘制炮管
    ctx.rotate(this.angle)
    ctx.fillStyle = '#666'
    ctx.fillRect(0, -this.barrelWidth/2, this.barrelLength, this.barrelWidth)
    
    // 炮管高光
    ctx.fillStyle = '#888'
    ctx.fillRect(0, -this.barrelWidth/2 + 2, this.barrelLength, 5)
    
    // 炮口
    ctx.fillStyle = '#444'
    ctx.fillRect(this.barrelLength - 5, -this.barrelWidth/2, 5, this.barrelWidth)
    
    ctx.restore()
    
    // 绘制等级数字
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(this.level, this.x, this.y + 5)
  }
}

// 子弹类
class Bullet {
  constructor(x, y, angle, damage, game) {
    this.x = x
    this.y = y
    this.angle = angle
    this.damage = damage
    this.game = game
    this.speed = 10
    this.radius = 5
  }
  
  update() {
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed
  }
  
  render(ctx) {
    ctx.fillStyle = '#ffff00'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    
    // 子弹拖尾
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'
    ctx.beginPath()
    ctx.arc(this.x - Math.cos(this.angle) * 5, this.y - Math.sin(this.angle) * 5, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}
