export default class Collision {
  // 圆形碰撞检测
  static checkCircleCollision(obj1, obj2) {
    // 计算两个物体的半径
    const radius1 = obj1.radius || Math.max(obj1.width || 0, obj1.height || 0) / 2
    const radius2 = obj2.radius || Math.max(obj2.width || 0, obj2.height || 0) / 2
    
    // 计算距离
    const dx = obj1.x - obj2.x
    const dy = obj1.y - obj2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 如果距离小于两个半径之和，说明碰撞
    return distance < radius1 + radius2
  }
  
  // 矩形碰撞检测
  static checkRectCollision(obj1, obj2) {
    const rect1 = this.getBoundingRect(obj1)
    const rect2 = this.getBoundingRect(obj2)
    
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }
  
  // 获取物体的包围矩形
  static getBoundingRect(obj) {
    if (obj.width && obj.height) {
      return {
        x: obj.x - obj.width / 2,
        y: obj.y - obj.height / 2,
        width: obj.width,
        height: obj.height
      }
    } else if (obj.radius) {
      return {
        x: obj.x - obj.radius,
        y: obj.y - obj.radius,
        width: obj.radius * 2,
        height: obj.radius * 2
      }
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }
}
