# AI学霸

基于 Web 的在线课程学习工具，实时语音转写、知识点识别、划词 AI 解释与跨课串联。

## 功能

- **实时语音转写** — 默认 **通义听悟**（阿里云实时推流 + WebSocket）；可切换浏览器 Web Speech API
- **知识点识别** — 预设 AI 应用知识点（RAG、MCP、Agent、LLM 等），实时高亮
- **知识卡片** — 点击高亮词查看详细解释，跨多节课串联追踪
- **划词操作** — 选中文本 → AI 解释 / 加入笔记 / 创建自定义知识点
- **Notion 风格 UI** — 简洁、科技感三栏布局
- **九上教材知识库** — 语文（统编人教）、数学（浙教）、历史（统编人教）各 50 条，目录对齐 [TapXWorld/ChinaTextbook](https://github.com/TapXWorld/ChinaTextbook)

重新生成词条：`npm run generate:knowledge`（编辑 `scripts/generateGrade9TextbookKnowledge.mjs` 后执行）。

## 快速开始

```bash
cd course-learn
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`（推荐 Chrome）。

## 演示模式

无麦克风时，点击底部「播放演示」模拟课程转写，自动触发知识点高亮。

## 接入通义听悟

1. 在 [听悟控制台](https://nls-portal.console.aliyun.com/tingwu/overview) 创建项目，获取 **AppKey**。
2. 创建阿里云 RAM **AccessKey**（仅需在本地 dev 服务端使用，不要写入前端 `VITE_` 变量）。
3. 配置 `.env`：

```env
ALIBABA_CLOUD_ACCESS_KEY_ID=LTAI...
ALIBABA_CLOUD_ACCESS_KEY_SECRET=...
TINGWU_APP_KEY=您的听悟AppKey
```

4. 重启 `npm run dev`。页头选择 **通义听悟**，点击「开始聆听」。麦克风或「标签页」捕获课程音频均可。

开发模式下 Vite 插件提供 `/api/tingwu/start|stop|status`；生产环境需自行部署相同 API（见 `server/tingwuService.mjs`）。

## 接入 DeepSeek

复制 `.env.example` 为 `.env`，填入 [DeepSeek](https://platform.deepseek.com/) API Key：

```bash
cp .env.example .env
```

```env
VITE_LLM_PROVIDER=deepseek
VITE_DEEPSEEK_API_KEY=sk-...
# 可选：VITE_LLM_MODEL=deepseek-chat | deepseek-reasoner
```

修改后需重启 `npm run dev`。未配置 Key 时使用本地演示文案。也支持任意 OpenAI 兼容接口（设置 `VITE_LLM_API_URL` + `VITE_LLM_API_KEY`）。

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS
- Web Speech API + getDisplayMedia（标签页音频）
- localStorage 持久化

## 项目结构

```
src/
├── components/     # UI 组件
├── data/           # 预设知识点 & 课程数据
├── hooks/          # 状态 & 语音识别
├── services/       # LLM 服务
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```
