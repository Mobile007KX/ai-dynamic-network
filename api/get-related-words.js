/**
 * 获取关联词API端点 - Vercel无服务器函数版本
 */

const { generateRelatedWords } = require('./gpt-integration');

// 词汇缓存
let cache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 缓存有效期24小时（毫秒）

// Vercel无服务器函数处理程序
async function handler(req, res) {
  // 支持OPTIONS请求（CORS预检）
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // 解析请求参数
    const { word, topic, count = 4 } = req.body;
    
    // 参数验证
    if (!word || !topic) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 缓存键
    const cacheKey = `${word}_${topic}_${count}`;
    
    // 检查缓存
    if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - CACHE_TTL) {
      return res.status(200).json({ relatedWords: cache[cacheKey].data });
    }
    
    // 调用GPT生成关联词
    const relatedWords = await generateRelatedWords(word, topic, count);
    
    // 更新缓存
    cache[cacheKey] = {
      data: relatedWords,
      timestamp: Date.now()
    };
    
    // 返回结果
    return res.status(200).json({ relatedWords });
  } catch (error) {
    console.error('获取关联词API错误:', error);
    return res.status(500).json({ error: '服务器处理请求时出错' });
  }
};

// 同时支持直接导出（Express）和模块导出（Vercel函数）
module.exports = handler;
module.exports.handler = handler;
