export default class Fish {
  constructor(x, y, angle, config, game) {
    this.x = x
    this.y = y
    this.angle = angle
    this.config = config
    this.game = game
    
    // 鱼的属性
    this.name = config.name
    this.level = config.level
    this.rate = config.rate // 倍率
    this.speed = config.speed
    this.hp = config.hp
    this.maxHp = config.hp
    this.color = config.color
    this.width = config.width
    this.height = config.height
    
    // 动画参数
    this.frame = 0
    this.wiggleOffset = 0
    this.wiggleSpeed = 0.1 + Math.random() * 0.1
  }
  
  update() {
    // 移动
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed
    
    // 摇摆动画
    this.wiggleOffset = Math.sin(this.frame) * 5
    this.frame += this.wiggleSpeed
    
    // 随机小角度调整，模拟真实鱼游动
    if (Math.random() < 0.02) {
      this.angle += (Math.random() - 0.5) * 0.2
      // 限制角度范围，不要偏离太多
      if (this.angle < -Math.PI * 0.75) this.angle = -Math.PI * 0.75
      if (this.angle > -Math.PI * 0.25) this.angle = -Math.PI * 0.25
    }
  }
  
  render(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.translate(0, this.wiggleOffset)
    
    // 绘制鱼身体
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 鱼鳍
    ctx.fillStyle = this.adjustColor(this.color, -20)
    ctx.beginPath()
    ctx.moveTo(-this.width/4, 0)
    ctx.lineTo(-this.width/2, -this.height/3)
    ctx.lineTo(-this.width/2, this.height/3)
    ctx.closePath()
    ctx.fill()
    
    // 鱼尾
    ctx.fillStyle = this.adjustColor(this.color, -30)
    ctx.beginPath()
    ctx.moveTo(this.width/2, 0)
    ctx.lineTo(this.width/2 + this.width/4, -this.height/3)
    ctx.lineTo(this.width/2 + this.width/4, this.height/3)
    ctx.closePath()
    ctx.fill()
    
    // 眼睛
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(-this.width/5, -this.height/6, 4, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(-this.width/5, -this.height/6, 2, 0, Math.PI * 2)
    ctx.fill()
    
    // 血量条（如果不是满血）
    if (this.hp < this.maxHp) {
      const barWidth = this.width
      const barHeight = 4
      const hpPercent = this.hp / this.maxHp
      
      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(-barWidth/2, -this.height/2 - 10, barWidth, barHeight)
      
      // 血量
      ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000'
      ctx.fillRect(-barWidth/2, -this.height/2 - 10, barWidth * hpPercent, barHeight)
    }
    
    ctx.restore()
  }
  
  // 调整颜色亮度
  adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
  }
}
