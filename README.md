# brainMapVoc - 动态词汇联想云

一个使用GPT-3.5实时生成相关词汇的交互式词汇联想应用。特别适合用于语言学习、词汇拓展和教育场景。

## 功能特点

- **动态词汇生成**：使用GPT-3.5模型实时生成相关联词汇，无需维护静态词库
- **交互式可视化**：以图形方式展示词汇之间的关联，支持拖拽和点击交互
- **多主题支持**：支持环境、教育、科技等多个主题领域
- **详细词汇信息**：提供发音、词性、例句等详细信息
- **响应式设计**：适应不同屏幕尺寸

## 安装与使用

### 前提条件

- Node.js v14+
- OpenAI API密钥

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/brainMapVoc.git
cd brainMapVoc
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，添加您的OpenAI API密钥
```

4. 启动服务器
```bash
npm start
```

5. 访问应用
在浏览器中打开 `http://localhost:3000`

## 项目结构

```
brainMapVoc/
├── api/                 # API端点
│   ├── get-related-words.js
│   ├── get-topic-words.js
│   └── gpt-integration/  # GPT集成模块
├── css/                 # 样式文件
├── js/                  # 客户端JavaScript
│   ├── api-client.js    # API客户端
│   ├── config.js        # 配置文件
│   ├── graph-utils.js   # 图形工具函数
│   └── main.js          # 主应用逻辑
├── public/              # 静态资源
├── .env.example         # 环境变量示例
├── index.html           # 主页
├── package.json         # 项目配置
├── README.md            # 项目说明
└── server.js            # 服务器入口
```

## 自定义配置

项目配置位于 `js/config.js` 文件中，可以根据需要调整：

- **图形参数**：节点数量、连接数、间距等
- **API设置**：端点、超时、重试次数
- **缓存策略**：是否启用缓存、有效期
- **主题列表**：可自定义添加新主题

## 技术栈

- **前端**：原生JavaScript、Canvas API
- **后端**：Node.js、Express
- **AI**：OpenAI GPT-3.5 API

## 贡献

欢迎贡献代码、报告问题或提出改进建议！

## 许可

[MIT](LICENSE)
