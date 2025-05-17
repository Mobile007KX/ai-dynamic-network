/**
 * 主页入口 - 用于Vercel部署
 */

const fs = require('fs');
const path = require('path');

// 读取HTML文件
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Vercel无服务器函数处理程序
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(htmlContent);
};
