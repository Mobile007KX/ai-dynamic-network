/**
 * API路由索引 - 用于Vercel部署
 */

// 状态检查处理程序
function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'online',
    message: 'BrainMapVoc API服务正常',
    endpoints: [
      '/api/get-topic-words',
      '/api/get-related-words'
    ],
    documentation: '请查看项目README了解更多信息'
  });
};

// 同时支持直接导出（Express）和模块导出（Vercel函数）
module.exports = handler;
module.exports.handler = handler;
