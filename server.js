/**
 * brainMapVoc 服务器入口文件
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// API路由
app.post('/api/get-related-words', require('./api/get-related-words'));
app.post('/api/get-topic-words', require('./api/get-topic-words'));

// API状态路由
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'BrainMapVoc API服务正常',
    endpoints: [
      '/api/get-topic-words',
      '/api/get-related-words'
    ]
  });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 用于本地开发的服务器启动
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 导出用于Vercel的函数
module.exports = app;