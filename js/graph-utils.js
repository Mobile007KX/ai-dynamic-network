/**
 * 图形工具类 - 负责处理画布、节点和连接的绘制
 */

class GraphUtils {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.center = { x: canvas.width / 2, y: canvas.height / 2 };
    
    // 初始化画布尺寸
    this.resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /**
   * 调整画布尺寸以匹配窗口
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
  }
  
  /**
   * 测量文本节点的半径
   * @param {string} text - 节点文本
   * @param {boolean} isCenter - 是否为中心节点
   * @returns {number} - 节点半径
   */
  measureTextRadius(text, isCenter = false) {
    const fontSize = isCenter ? this.config.graph.centerNodeSize : this.config.graph.normalNodeSize;
    this.ctx.font = `${fontSize}px Arial Black`;
    const metrics = this.ctx.measureText(text);
    return Math.ceil(Math.max(metrics.width, 30) / 2 + this.config.graph.paddingAround);
  }
  
  /**
   * 创建新节点
   * @param {string} text - 节点文本
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Object} - 节点对象
   */
  createNode(text, x, y) {
    const radius = this.measureTextRadius(text);
    return {
      text,
      x,
      y,
      vx: 0,       // X方向速度
      vy: 0,       // Y方向速度
      fx: null,    // X方向固定力
      fy: null,    // Y方向固定力
      links: [],   // 连接的节点
      expanded: false,  // 是否已展开
      radius,      // 节点半径
      dragging: false,  // 是否正在拖动
      isLoading: false  // 是否正在加载
    };
  }
  
  /**
   * 计算两个节点间的距离
   * @param {Object} n1 - 节点1
   * @param {Object} n2 - 节点2
   * @returns {number} - 距离
   */
  distance(n1, n2) {
    return Math.hypot(n1.x - n2.x, n1.y - n2.y);
  }
  
  /**
   * 确保节点在可见区域内
   * @param {Object} node - 节点对象
   * @returns {Object} - 调整后的节点
   */
  ensureNodeInView(node) {
    const margin = 20; // 边缘安全距离
    
    // 检查并调整X坐标
    if (node.x - node.radius < margin) {
      node.x = node.radius + margin;
    } else if (node.x + node.radius > this.canvas.width - margin) {
      node.x = this.canvas.width - node.radius - margin;
    }
    
    // 检查并调整Y坐标
    if (node.y - node.radius < margin) {
      node.y = node.radius + margin;
    } else if (node.y + node.radius > this.canvas.height - margin) {
      node.y = this.canvas.height - node.radius - margin;
    }
    
    return node;
  }
  
  /**
   * 为子节点生成合适的位置（确保在可见区域内）
   * @param {Object} parentNode - 父节点
   * @returns {Object} - {x, y} 坐标
   */
  generateChildPosition(parentNode) {
    // 可见区域减去边距
    const margin = 40;
    const minX = margin;
    const maxX = this.canvas.width - margin;
    const minY = margin;
    const maxY = this.canvas.height - margin;
    
    // 中心位置（默认为父节点位置）
    const centerX = parentNode.x;
    const centerY = parentNode.y;
    
    // 多次尝试找到合适的位置
    for (let attempt = 0; attempt < 12; attempt++) {
      // 生成随机角度和距离
      let radius = 80 + Math.random() * 70;
      let angle = Math.random() * 2 * Math.PI;
      
      // 计算位置
      let x = centerX + Math.cos(angle) * radius;
      let y = centerY + Math.sin(angle) * radius;
      
      // 估计节点半径（大致估计，确保足够空间）
      const estimatedRadius = 50;
      
      // 检查是否在可见区域内
      if (x >= minX + estimatedRadius && 
          x <= maxX - estimatedRadius && 
          y >= minY + estimatedRadius && 
          y <= maxY - estimatedRadius) {
        // 找到合适位置
        return { x, y };
      }
    }
    
    // 如果多次尝试后仍未找到合适位置，使用中心区域的随机位置
    const centerAreaX = this.canvas.width / 2;
    const centerAreaY = this.canvas.height / 2;
    const safeRadius = Math.min(this.canvas.width, this.canvas.height) / 4;
    
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * safeRadius;
    
    return {
      x: centerAreaX + Math.cos(angle) * radius,
      y: centerAreaY + Math.sin(angle) * radius
    };
  }
  
  /**
   * 绘制箭头连接
   * @param {Object} from - 起始节点
   * @param {Object} to - 目标节点
   * @param {number} width - 线条宽度
   */
  drawArrow(from, to, width) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const len = Math.hypot(dx, dy);
    const arrowLength = 12;
    const arrowWidth = 7;

    this.ctx.strokeStyle = '#999';
    this.ctx.fillStyle = '#999';
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();

    const tx = to.x - Math.cos(angle) * to.radius;
    const ty = to.y - Math.sin(angle) * to.radius;

    this.ctx.beginPath();
    this.ctx.moveTo(tx, ty);
    this.ctx.lineTo(tx - arrowLength * Math.cos(angle - 0.3), ty - arrowLength * Math.sin(angle - 0.3));
    this.ctx.lineTo(tx - arrowLength * Math.cos(angle + 0.3), ty - arrowLength * Math.sin(angle + 0.3));
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * 在指定位置绘制节点
   * @param {Object} node - 节点对象
   * @param {boolean} isCenter - 是否为中心节点
   */
  drawNode(node, isCenter = false) {
    // 节点背景
    this.ctx.beginPath();
    this.ctx.fillStyle = '#000';
    this.ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // 节点文本
    this.ctx.fillStyle = '#fff';
    const fontSize = isCenter ? this.config.graph.centerNodeSize : this.config.graph.normalNodeSize;
    this.ctx.font = `${fontSize}px Arial Black`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.save();
    this.ctx.translate(node.x, node.y);
    this.ctx.rotate(0);
    this.ctx.fillText(node.text, 0, 0);
    this.ctx.restore();
  }
  
  /**
   * 查找指定坐标下的节点
   * @param {Array} nodes - 节点数组
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Object|null} - 找到的节点或null
   */
  findNodeAtPosition(nodes, x, y) {
    return nodes.find(n => this.distance({ x, y }, n) <= n.radius) || null;
  }
}

// 创建工具类实例
const graphUtils = new GraphUtils(document.getElementById('cloud'), CONFIG);