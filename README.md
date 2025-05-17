# AI Dynamic Network - 动态知识网络可视化

一个使用GPT-3.5实时生成知识联系的交互式网络可视化应用。适用于学习探索、概念关联、研究分析、教育等多种场景。

## 功能特点

- **智能知识关联**：使用GPT-3.5模型实时生成概念之间的关联，无需预设固定关系
- **网络可视化交互**：以动态网络图形展示知识点之间的连接，支持拖拽、缩放和点击交互
- **多领域探索**：支持科学、教育、商业、技术等多个知识领域
- **深度关联分析**：提供概念之间的关联类型和强度分析
- **响应式设计**：适应不同设备和屏幕尺寸

## 安装与使用

### 前提条件

- Node.js v14+
- OpenAI API密钥

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/Mobile007KX/ai-dynamic-network-new.git
cd ai-dynamic-network-new
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
ai-dynamic-network/
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
├── index.html           # 主页
├── index.js             # Vercel入口
├── package.json         # 项目配置
├── README.md            # 项目说明
├── server.js            # 服务器入口
└── vercel.json          # Vercel配置
```

## 应用场景

- **学术研究**：探索学术概念之间的关联和交叉领域
- **课程规划**：规划课程内容和知识点的逻辑关系
- **创意发想**：进行创意头脑风暴和概念扩展
- **知识管理**：构建个人或组织的知识地图
- **企业决策**：分析业务概念和市场因素的关联

## 技术栈

- **前端**：原生JavaScript、D3.js可视化
- **后端**：Node.js、Express
- **AI**：OpenAI GPT-3.5 API
- **部署**：Vercel

## 贡献

欢迎贡献代码、报告问题或提出改进建议！

## 许可

[MIT](LICENSE)
