/**
 * brainMapVoc 配置文件
 */

const CONFIG = {
  // 图形相关配置
  graph: {
    maxNodes: 20,           // 最大节点数量
    maxConnections: 4,      // 每个节点的最大连接数
    minSpacing: 10,         // 节点之间的最小间距
    centerNodeSize: 18,     // 中心节点的字体大小
    normalNodeSize: 16,     // 普通节点的字体大小
    paddingAround: 14,      // 文本周围的内边距
    transitionTime: 0.2     // 动画过渡时间(秒)
  },
  
  // API相关配置
  api: {
    baseUrl: '/api',                       // API基础URL
    endpoints: {
      relatedWords: '/get-related-words',   // 获取关联词API
      topicWords: '/get-topic-words'        // 获取主题词API
    },
    timeout: 10000,                        // API超时时间(毫秒)
    retries: 2                             // 失败重试次数
  },
  
  // 缓存设置
  cache: {
    enabled: true,          // 是否启用缓存
    maxAge: 24 * 60 * 60    // 缓存有效期(秒)
  },
  
  // 词汇分类
  topics: [
    '环境与自然',
    '教育与学习',
    '科技与创新',
    '社会与文化',
    '健康与医疗',
    '城市与建筑'
  ],
  
  // 备用词汇 - 当API调用失败时使用
  fallbackWords: {
    '环境与自然': ['environment', 'ecosystem', 'sustainable', 'biodiversity', 'conservation'],
    '教育与学习': ['education', 'curriculum', 'academic', 'knowledge', 'learning'],
    '科技与创新': ['technology', 'innovation', 'digital', 'artificial', 'algorithm'],
    '社会与文化': ['society', 'culture', 'heritage', 'tradition', 'diversity'],
    '健康与医疗': ['health', 'medical', 'treatment', 'wellness', 'prevention'],
    '城市与建筑': ['urban', 'architecture', 'infrastructure', 'planning', 'development']
  }
};