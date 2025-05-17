/**
 * GPT 集成API服务
 * 处理与OpenAI API的通信，获取动态生成的词汇
 */

const API_KEY = process.env.OPENAI_API_KEY || 'your-api-key';
const fetch = require('node-fetch');

/**
 * 调用OpenAI API生成关联词
 * @param {string} word - 中心词
 * @param {string} topic - 主题类别
 * @param {number} count - 需要的词汇数量
 * @returns {Promise<Array>} - 关联词数组
 */
async function generateRelatedWords(word, topic, count = 4) {
  try {
    const prompt = `请为英语单词"${word}"生成${count}个相关联的单词，主题类别是"${topic}"。
      - 只需返回单词列表，不要有额外解释
      - 每个词应适合用于IELTS/托福等英语考试，并与主题相关
      - 每个词要简洁有力，避免过于简单的词`;
    
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.choices[0].text.trim();
    
    // 解析返回文本，提取单词列表
    const wordList = text.split(/[\n,]+/).map(w => w.trim()).filter(w => w);
    
    // 返回不超过请求数量的单词
    return wordList.slice(0, count);
  } catch (error) {
    console.error('生成关联词失败:', error);
    throw error;
  }
}

/**
 * 调用OpenAI API生成主题词汇
 * @param {string} topic - 主题类别
 * @param {number} count - 需要的词汇数量
 * @returns {Promise<Array>} - 主题词汇数组
 */
async function generateTopicWords(topic, count = 5) {
  try {
    const prompt = `请为主题"${topic}"生成${count}个具有代表性的英语单词。
      - 只需返回单词列表，不要有额外解释
      - 每个词应适合用于IELTS/托福等英语考试
      - 优先选择与主题强相关的核心词汇`;
    
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.choices[0].text.trim();
    
    // 解析返回文本，提取单词列表
    const wordList = text.split(/[\n,]+/).map(w => w.trim()).filter(w => w);
    
    // 返回不超过请求数量的单词
    return wordList.slice(0, count);
  } catch (error) {
    console.error('生成主题词汇失败:', error);
    throw error;
  }
}

module.exports = {
  generateRelatedWords,
  generateTopicWords
};