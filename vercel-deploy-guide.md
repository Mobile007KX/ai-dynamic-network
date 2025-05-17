# AI Dynamic Network Vercel 部署指南

## 部署步骤

### 1. 登录 Vercel

在浏览器中打开 [Vercel](https://vercel.com/) 并登录您的账户。

### 2. 导入项目

1. 点击 "Import Project" 或 "New Project" 按钮
2. 选择 "Import Git Repository" 选项
3. 选择 GitHub 仓库 "brainmapvoc"

### 3. 配置部署设置

确保以下设置正确配置：

- **Framework Preset**: 选择 "Other" 或 "Node.js"
- **Build Command**: 使用 `npm run vercel-build`
- **Output Directory**: 留空
- **Development Command**: `npm run dev`

### 4. 环境变量设置

点击 "Environment Variables" 部分，添加以下环境变量：

- `OPENAI_API_KEY`: 您的OpenAI API密钥
- `OPENAI_ENDPOINT`: (可选) 如果使用自定义端点
- `NODE_ENV`: 设置为 "production"

### 5. 完成部署

点击 "Deploy" 按钮开始部署过程。

## 常见问题排查

### API请求失败

- 检查环境变量是否正确设置
- 验证OpenAI API密钥是否有效
- 检查浏览器控制台是否有CORS错误

### 部署失败

- 检查构建日志中的错误信息
- 确认所有依赖项已正确列在package.json中
- 验证服务器代码中没有使用文件系统操作（除非必要）

### 自定义域名

1. 在Vercel项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照Vercel提供的DNS配置说明进行设置

## 部署后检查列表

- 访问主页确认页面正确加载
- 测试API端点 (`/api/get-topic-words` 和 `/api/get-related-words`)
- 尝试创建思维导图并验证词汇生成功能
