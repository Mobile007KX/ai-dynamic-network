/**
 * API客户端 - 负责与后端API交互获取词汇数据
 */

class ApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.api.baseUrl;
    this.endpoints = config.api.endpoints;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
    
    // 初始化缓存
    this.cache = {
      related: {},
      topic: {}
    };
  }
  
  /**
   * 发送API请求
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} - 响应数据
   */
  async _fetchApi(endpoint, data, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt <= this.retries) {
        console.log(`请求失败，重试 ${attempt}/${this.retries}...`);
        return this._fetchApi(endpoint, data, attempt + 1);
      }
      throw error;
    }
  }
  
  /**
   * 模拟API调用（开发使用，实际项目中替换为真实API调用）
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} - 模拟数据
   */
  async _mockApi(endpoint, data) {
    // 延迟300-800ms，模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    if (endpoint === this.endpoints.relatedWords) {
      const { word, topic, count } = data;
      return this._generateMockRelatedWords(word, topic, count);
    } else if (endpoint === this.endpoints.topicWords) {
      const { topic, count } = data;
      return this._generateMockTopicWords(topic, count);
    }
    
    throw new Error(`未知的API端点: ${endpoint}`);
  }
  
  /**
   * 生成模拟的关联词（替换为实际GPT调用）
   */
  _generateMockRelatedWords(word, topic, count) {
    // 从备用词汇中选择词汇，并排除当前词
    const fallbackList = CONFIG.fallbackWords[topic] || [];
    const baseWords = [
      'analysis', 'comprehensive', 'fundamental', 'significant', 'development',
      'innovation', 'framework', 'sustainable', 'interaction', 'perspective',
      'generation', 'diversity', 'implementation', 'methodology', 'collaboration',
      'emerging', 'strategy', 'assessment', 'integration', 'transformation'
    ];
    
    // 合并基础词汇和备用词汇
    const candidates = [...new Set([...fallbackList, ...baseWords])].filter(w => w !== word);
    
    // 随机选择指定数量的词汇
    const result = [];
    for (let i = 0; i < count && candidates.length > 0; i++) {
      const index = Math.floor(Math.random() * candidates.length);
      result.push(candidates[index]);
      candidates.splice(index, 1);
    }
    
    return { relatedWords: result };
  }
  
  /**
   * 生成模拟的主题词汇（替换为实际GPT调用）
   */
  _generateMockTopicWords(topic, count) {
    // 使用备用词汇作为模拟数据
    const fallbackList = CONFIG.fallbackWords[topic] || [];
    return { topicWords: fallbackList.slice(0, count) };
  }
  
  /**
   * 获取主题相关词汇
   * @param {string} topic - 主题
   * @param {number} count - 需要的词汇数量
   * @returns {Promise<string[]>} - 主题词汇列表
   */
  async getWordsByTopic(topic, count = 5) {
    // 检查缓存
    const cacheKey = `${topic}_${count}`;
    if (this.config.cache.enabled && this.cache.topic[cacheKey]) {
      console.log(`[缓存] 使用缓存的主题词汇: ${topic}`);
      return this.cache.topic[cacheKey];
    }
    
    try {
      // 调用API获取数据
      // const data = await this._fetchApi(this.endpoints.topicWords, { topic, count });
      
      // 使用模拟API（开发环境）
      const data = await this._mockApi(this.endpoints.topicWords, { topic, count });
      
      // 存入缓存
      if (this.config.cache.enabled) {
        this.cache.topic[cacheKey] = data.topicWords;
      }
      
      return data.topicWords;
    } catch (error) {
      console.error('获取主题词汇失败:', error);
      
      // 失败时返回备用词汇
      return CONFIG.fallbackWords[topic] || ['environment', 'education', 'technology', 'society', 'health'].slice(0, count);
    }
  }
  
  /**
   * 获取关联词
   * @param {string} word - 中心词
   * @param {string} topic - 主题
   * @param {number} count - 需要的关联词数量
   * @returns {Promise<string[]>} - 关联词列表
   */
  async getRelatedWords(word, topic, count = 4) {
    // 检查缓存
    const cacheKey = `${word}_${topic}_${count}`;
    if (this.config.cache.enabled && this.cache.related[cacheKey]) {
      console.log(`[缓存] 使用缓存的关联词: ${word}`);
      return this.cache.related[cacheKey];
    }
    
    try {
      // 调用API获取数据
      // const data = await this._fetchApi(this.endpoints.relatedWords, { word, topic, count });
      
      // 使用模拟API（开发环境）
      const data = await this._mockApi(this.endpoints.relatedWords, { word, topic, count });
      
      // 存入缓存
      if (this.config.cache.enabled) {
        this.cache.related[cacheKey] = data.relatedWords;
      }
      
      return data.relatedWords;
    } catch (error) {
      console.error('获取关联词失败:', error);
      
      // 失败时返回备用关联词
      return ['concept', 'analysis', 'development', 'strategy', 'framework'].slice(0, count);
    }
  }
}

// 创建API客户端实例
const apiClient = new ApiClient(CONFIG);