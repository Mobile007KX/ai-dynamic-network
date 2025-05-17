/**
 * brainMapVoc - 主应用逻辑
 * 动态词汇联想云应用，使用GPT-3.5进行词汇生成
 */

class BrainMapApp {
  constructor() {
    // DOM元素
    this.canvas = document.getElementById('cloud');
    this.ctx = this.canvas.getContext('2d');
    this.topicSelect = document.getElementById('topic-select');
    this.newTopicBtn = document.getElementById('new-topic-btn');
    this.loadingOverlay = document.getElementById('loading-overlay');
    
    // 应用状态
    this.nodes = [];
    this.links = [];
    this.centerNode = null;
    this.currentTopic = this.topicSelect.value;
    this.isStable = false;
    this.activeTooltip = null;
    
    // 初始化事件监听器
    this.initEventListeners();
    
    // 启动应用
    this.initApp();
  }
  
  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 主题切换按钮点击事件
    this.newTopicBtn.addEventListener('click', () => this.changeTopicHandler());
    
    // 鼠标按下事件 - 处理拖动和点击
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    
    // 双击事件 - 显示词汇详情
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
    
    // 点击外部区域关闭提示框
    document.addEventListener('click', (e) => this.handleDocumentClick(e));
  }
  
  /**
   * 显示加载遮罩
   */
  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }
  
  /**
   * 隐藏加载遮罩
   */
  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }
  
  /**
   * 显示节点加载状态
   * @param {Object} node - 节点对象
   */
  showNodeLoading(node) {
    node.isLoading = true;
    node.originalText = node.text;
    
    let dots = 0;
    node.loadingInterval = setInterval(() => {
      node.text = node.originalText + '.'.repeat(dots);
      dots = (dots + 1) % 4;
    }, 300);
  }
  
  /**
   * 隐藏节点加载状态
   * @param {Object} node - 节点对象
   */
  hideNodeLoading(node) {
    if (node.loadingInterval) {
      clearInterval(node.loadingInterval);
      node.text = node.originalText;
      node.isLoading = false;
      delete node.loadingInterval;
      delete node.originalText;
    }
  }
  
  /**
   * 添加节点到图形
   * @param {Object} node - 节点对象
   */
  addNode(node) {
    this.nodes.push(node);
  }
  
  /**
   * 连接两个节点
   * @param {Object} a - 起始节点
   * @param {Object} b - 目标节点
   */
  link(a, b) {
    this.links.push({ a, b });
    a.links.push(b);
    b.links.push(a);
  }
  
  /**
   * 设置中心节点
   * @param {Object} node - 要设置为中心的节点
   */
  focusNode(node) {
    if (this.centerNode) this.centerNode.expanded = true;
    this.centerNode = node;
    node.radius = graphUtils.measureTextRadius(node.text, true);
    this.isStable = false;
  }
  
  /**
   * 移除多余节点以控制图形复杂度
   */
  removeOldNodes() {
    if (this.nodes.length <= CONFIG.graph.maxNodes) return;
    const keepSet = new Set([this.centerNode, ...this.centerNode.links]);
    this.nodes = this.nodes.filter(n => keepSet.has(n));
    this.links = this.links.filter(({ a, b }) => this.nodes.includes(a) && this.nodes.includes(b));
  }
  
  /**
   * 处理鼠标按下事件
   * @param {MouseEvent} e - 鼠标事件
   */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = graphUtils.findNodeAtPosition(this.nodes, x, y);
    
    if (node) {
      // 不允许拖动中心节点
      if (node === this.centerNode) {
        return;
      }
      
      node.dragging = true;
      this.isStable = false;
      
      // 记录初始点击位置和节点位置之间的偏移量
      const offsetX = x - node.x;
      const offsetY = y - node.y;
      
      const mouseMoveHandler = (evt) => {
        const mx = evt.clientX - rect.left;
        const my = evt.clientY - rect.top;
        
        // 应用偏移量，使拖动感觉更自然
        node.x = mx - offsetX;
        node.y = my - offsetY;
        
        // 确保节点在可见区域内
        graphUtils.ensureNodeInView(node);
      };
      
      const mouseUpHandler = (evt) => {
        // 计算移动距离，判断是点击还是拖动
        const mx = evt.clientX - rect.left;
        const my = evt.clientY - rect.top;
        const movedDistance = Math.hypot(mx - x, my - y);
        
        // 结束拖动
        node.dragging = false;
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        
        // 如果只是轻微移动，视为点击操作
        if (movedDistance < 5 && !node.expanded) {
          this.handleNodeClick(node);
        }
      };
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
  }
  
  /**
   * 处理节点点击事件
   * @param {Object} node - 点击的节点
   */
  async handleNodeClick(node) {
    if (!node || node.expanded || node.isLoading) return;
    
    this.focusNode(node);
    this.showNodeLoading(node);
    
    try {
      // 获取与此节点相关联的词汇
      const relatedWords = await apiClient.getRelatedWords(
        node.text, 
        this.currentTopic, 
        CONFIG.graph.maxConnections
      );
      
      // 标记已展开
      node.expanded = true;
      
      // 为每个关联词创建节点
      for (let i = 0; i < relatedWords.length; i++) {
        const word = relatedWords[i];
        
        // 检查是否已存在此词的节点
        const existingNode = this.nodes.find(n => n.text === word);
        if (existingNode) {
          // 如果已存在节点，只需建立连接
          this.link(node, existingNode);
          continue;
        }
        
        // 创建新节点
        const position = graphUtils.generateChildPosition(node);
        const child = graphUtils.createNode(word, position.x, position.y);
        graphUtils.ensureNodeInView(child);
        
        // 添加节点和连接
        this.addNode(child);
        this.link(node, child);
      }
      
      // 移除远端节点保持图的简洁
      this.removeOldNodes();
    } catch (error) {
      console.error('展开节点失败:', error);
    } finally {
      this.hideNodeLoading(node);
    }
  }
  
  /**
   * 处理双击事件
   * @param {MouseEvent} e - 鼠标事件
   */
  handleDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = graphUtils.findNodeAtPosition(this.nodes, x, y);
    
    if (node) {
      // 计算提示框显示位置（避免边缘溢出）
      const tipX = Math.min(e.clientX, window.innerWidth - 320);
      const tipY = Math.min(e.clientY, window.innerHeight - 200);
      
      this.showWordTooltip(node.text, tipX, tipY);
    }
  }
  
  /**
   * 处理文档点击事件（关闭提示框）
   * @param {MouseEvent} e - 鼠标事件
   */
  handleDocumentClick(e) {
    if (this.activeTooltip && !this.activeTooltip.contains(e.target)) {
      this.hideWordTooltip();
    }
  }
  
  /**
   * 显示词汇详情提示框
   * @param {string} word - 词汇
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  showWordTooltip(word, x, y) {
    // 如果有活动的提示框，先移除
    this.hideWordTooltip();
    
    // 创建提示框元素
    const tooltip = document.createElement('div');
    tooltip.className = 'word-tooltip';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    
    // 模拟词汇数据（实际项目中应从API获取）
    const wordData = this.simulateWordData(word);
    
    // 词汇标题
    const title = document.createElement('div');
    title.className = 'tooltip-title';
    title.innerHTML = `${word} <span class="tooltip-phonetic">${wordData.phonetic || ''}</span>`;
    tooltip.appendChild(title);
    
    // 词性和词义
    const meaning = document.createElement('div');
    meaning.className = 'tooltip-meaning';
    meaning.innerHTML = `<span class="tooltip-pos">${wordData.pos || ''}</span> ${wordData.meaning || ''}`;
    tooltip.appendChild(meaning);
    
    // 示例句子
    if (wordData.example) {
      const example = document.createElement('div');
      example.className = 'tooltip-example';
      example.textContent = wordData.example;
      tooltip.appendChild(example);
    }
    
    // 翻译
    if (wordData.translation) {
      const translation = document.createElement('div');
      translation.className = 'tooltip-translation';
      translation.textContent = wordData.translation;
      tooltip.appendChild(translation);
    }
    
    // 关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '×';
    closeBtn.className = 'tooltip-close';
    closeBtn.onclick = () => this.hideWordTooltip();
    tooltip.appendChild(closeBtn);
    
    document.body.appendChild(tooltip);
    this.activeTooltip = tooltip;
  }
  
  /**
   * 隐藏词汇详情提示框
   */
  hideWordTooltip() {
    if (this.activeTooltip) {
      document.body.removeChild(this.activeTooltip);
      this.activeTooltip = null;
    }
  }
  
  /**
   * 生成模拟词汇数据（开发用，实际项目应替换为API调用）
   * @param {string} word - 词汇
   * @returns {Object} - 词汇数据
   */
  simulateWordData(word) {
    // 常见词性
    const posList = ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.'];
    
    // 根据词汇生成模拟数据
    return {
      phonetic: `/ˈsɪmjəleɪt/`,
      pos: posList[Math.floor(Math.random() * posList.length)],
      meaning: `A word associated with ${this.currentTopic} category`,
      example: `The ${word} plays a crucial role in modern society.`,
      translation: `与${this.currentTopic}类别相关的词汇`,
      band: Math.floor(Math.random() * 3) + 6  // 模拟雅思词汇等级 6-8
    };
  }
  
  /**
   * 布局算法 - 节点位置计算
   */
  layout() {
    let moving = false;
    
    // 节点间排斥力计算
    for (let i = 0; i < this.nodes.length; i++) {
      let n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        let n2 = this.nodes[j];
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let d = Math.max(graphUtils.distance(n1, n2), 1);
        const minDist = n1.radius + n2.radius + CONFIG.graph.minSpacing;
        let overlap = minDist - d;
        if (overlap > 0) {
          let fx = (overlap * dx / d) * 0.5;
          let fy = (overlap * dy / d) * 0.5;
          if (!n1.dragging) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (!n2.dragging) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }
    }
    
    // 添加边界力，防止节点移出视野
    const margin = 20; // 边缘安全距离
    
    for (let n of this.nodes) {
      // 应用边界力，随着节点接近边界，力量增大
      // 左边界
      if (n.x - n.radius < margin) {
        n.vx += (margin - (n.x - n.radius)) * 0.1;
      }
      // 右边界
      if (n.x + n.radius > this.canvas.width - margin) {
        n.vx -= ((n.x + n.radius) - (this.canvas.width - margin)) * 0.1;
      }
      // 上边界
      if (n.y - n.radius < margin) {
        n.vy += (margin - (n.y - n.radius)) * 0.1;
      }
      // 下边界
      if (n.y + n.radius > this.canvas.height - margin) {
        n.vy -= ((n.y + n.radius) - (this.canvas.height - margin)) * 0.1;
      }
      
      // 应用速度和更新位置
      if (n !== this.centerNode && !n.dragging) {
        n.vx *= 0.8;
        n.vy *= 0.8;
        if (Math.abs(n.vx) > 0.05 || Math.abs(n.vy) > 0.05) {
          moving = true;
          n.x += n.vx * 0.2;
          n.y += n.vy * 0.2;
        }
      } else if (n === this.centerNode && !n.dragging) {
        const dx = graphUtils.center.x - n.x;
        const dy = graphUtils.center.y - n.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          moving = true;
          n.x += dx * 0.2;
          n.y += dy * 0.2;
        }
      }
      
      // 最终确保节点在视野内
      graphUtils.ensureNodeInView(n);
    }
    
    this.isStable = !moving;
  }
  
  /**
   * 绘制图形
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制连接
    for (let { a, b } of this.links) {
      graphUtils.drawArrow(a, b, a === this.centerNode ? 3 : 1.5);
    }
    
    // 绘制节点
    for (let n of this.nodes) {
      graphUtils.drawNode(n, n === this.centerNode);
    }
  }
  
  /**
   * 切换主题处理函数
   */
  async changeTopicHandler() {
    // 获取选择的主题
    const newTopic = this.topicSelect.value;
    this.currentTopic = newTopic;
    
    // 显示加载状态
    this.showLoading();
    this.newTopicBtn.disabled = true;
    const originalText = this.newTopicBtn.textContent;
    this.newTopicBtn.textContent = '加载中...';
    
    try {
      // 重置图形
      this.nodes = [];
      this.links = [];
      this.centerNode = null;
      
      // 从新主题选择词汇
      const topicWords = await apiClient.getWordsByTopic(this.currentTopic);
      const startWord = topicWords[0] || 'environment';
      
      // 创建新的中心节点
      const root = graphUtils.createNode(startWord, graphUtils.center.x, graphUtils.center.y);
      this.addNode(root);
      this.focusNode(root);
      
      // 创建初始关联词节点
      await this.handleNodeClick(root);
    } catch (error) {
      console.error('切换主题失败:', error);
    } finally {
      this.hideLoading();
      this.newTopicBtn.textContent = originalText;
      this.newTopicBtn.disabled = false;
    }
  }
  
  /**
   * 异步初始化应用程序
   */
  async initApp() {
    // 显示加载状态
    this.showLoading();
    
    try {
      // 初始主题
      this.currentTopic = this.topicSelect.value || '环境与自然';
      
      // 从当前主题选择词汇开始
      const topicWords = await apiClient.getWordsByTopic(this.currentTopic);
      const startWord = topicWords[0] || 'environment';
      
      // 创建中心节点
      const root = graphUtils.createNode(startWord, graphUtils.center.x, graphUtils.center.y);
      this.addNode(root);
      this.focusNode(root);
      
      // 创建初始关联词节点
      await this.handleNodeClick(root);
    } catch (error) {
      console.error('初始化应用程序失败:', error);
    } finally {
      this.hideLoading();
    }
    
    // 启动动画循环
    this.startAnimationLoop();
  }
  
  /**
   * 开始动画循环
   */
  startAnimationLoop() {
    const animate = () => {
      if (!this.isStable) this.layout();
      this.draw();
      requestAnimationFrame(animate);
    };
    
    // 启动动画
    animate();
  }
}

// 当DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
  // 创建应用实例
  window.app = new BrainMapApp();
});