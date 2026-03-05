# 宝可梦微信小程序

基于 Vue3 + TypeScript + Pinia 的宝可梦主题微信小程序，通过 GraphQL API 与 PokeAPI 集成。

## 功能特性

- 🔍 **搜索功能**: 模糊搜索宝可梦物种，支持防抖和分页
- 📱 **详情页面**: 查看宝可梦的详细信息、技能和属性
- 🎨 **主题系统**: 三种可切换的视觉主题（宝可梦、暗色、亮色）
- 👋 **欢迎界面**: 首次启动时的友好欢迎体验
- 💾 **状态持久化**: 自动保存用户偏好和搜索状态
- 📊 **状态管理**: 使用 Pinia 进行全局状态管理
- ✅ **测试覆盖**: 134 个测试用例，覆盖核心功能

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **状态管理**: Pinia
- **样式**: Less
- **HTTP 客户端**: Axios (适配微信小程序)
- **API**: PokeAPI GraphQL (https://beta.pokeapi.co/graphql/v1beta)
- **测试**: Vitest + Vue Test Utils

## 环境要求

- Node.js >= 16.0.0
- 微信开发者工具

## 安装

```bash
# 安装依赖
npm install --legacy-peer-deps
```

## 开发

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 监听模式运行测试
npm run test:watch
```

## 构建

```bash
# 构建生产版本
npm run build
```

## 微信开发者工具配置

1. 打开微信开发者工具
2. 导入项目，选择 `dist/dev/mp-weixin` 目录
3. 在"详情 > 本地设置"中：
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
   - 勾选"启用 ES6 转 ES5"
   - 勾选"启用增强编译"

## 项目结构

```
src/
├── api/              # GraphQL 客户端
├── components/       # Vue 组件
├── pages/           # 页面组件
│   ├── search/      # 搜索页面
│   └── detail/      # 详情页面
├── stores/          # Pinia 状态管理
├── styles/          # 全局样式
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数和组合式函数
└── App.vue          # 应用入口
```

## 测试

项目包含完整的测试套件：

- 单元测试：API 客户端、状态管理、工具函数
- 组件测试：Vue 组件的行为和交互
- 集成测试：完整的用户流程

运行测试：

```bash
npm test
```

## 规范文档

详细的需求、设计和实现计划请查看：

- [需求文档](.kiro/specs/pokemon-miniapp/requirements.md)
- [设计文档](.kiro/specs/pokemon-miniapp/design.md)
- [任务列表](.kiro/specs/pokemon-miniapp/tasks.md)

## License

MIT
