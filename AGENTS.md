# AGENTS.md

## 项目概览
DouK-Downloader 是一个短视频无水印解析下载的Web应用，基于开源项目 JoeanAmier/TikTokDownloader 开发。

### 版本技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

### 核心功能
1. **链接解析**: 支持抖音、TikTok视频、图集、音频链接解析
2. **无水印下载**: 获取原画质量的视频、图集、音频文件
3. **批量采集**: 支持账号作品批量下载、合集批量下载
4. **任务管理**: 实时进度反馈、下载状态追踪

## 目录结构
```
├── public/                 # 静态资源
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API接口
│   │   │   ├── parse/      # 链接解析接口
│   │   │   ├── download/   # 文件下载接口
│   │   │   └── batch/      # 批量采集接口
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页
│   │   └── globals.css     # 全局样式
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   └── lib/                # 工具库
├── DESIGN.md               # 设计规范文件
└── AGENTS.md               # 项目文档（本文件）
```

## API接口说明

### 1. 解析接口 `/api/parse`
- **POST**: 解析抖音/TikTok链接
  - 参数: `{ url: string, platform: 'douyin' | 'tiktok' }`
  - 返回: 解析结果（标题、作者、封面、下载地址等）
- **GET**: 查询已解析的历史记录
  - 参数: `id` (作品ID)

### 2. 下载接口 `/api/download`
- **POST**: 下载解析后的资源文件
  - 参数: `{ url: string, filename: string, type: 'video' | 'images' | 'audio' }`
  - 返回: 文件流（流式下载）
- **GET**: 流式下载大文件
  - 参数: `url`, `filename`

### 3. 批量采集接口 `/api/batch`
- **POST**: 创建批量采集任务
  - 参数: `{ type, platform, url, concurrency, retryCount, ... }`
- **GET**: 查询任务状态
- **DELETE**: 删除任务

## 开发规范

### 包管理
- **仅使用 pnpm**: `pnpm add <package>`
- **严禁 npm/yarn**

### 编码规范
- TypeScript strict 模式
- 禁止隐式 any
- 函数参数必须标注类型
- 禁止使用 head 标签（使用 metadata）
- 遵循 Hydration 规范（use client + useEffect）

### 前端样式
- 使用 shadcn/ui 组件
- Tailwind CSS 类名
- 深色主题为主
- 参考 DESIGN.md 设计规范

## 后端集成指南

### 连接真实TikTokDownloader后端
1. 安装并运行 TikTokDownloader Web API 模式:
   ```bash
   git clone https://github.com/JoeanAmier/TikTokDownloader
   cd TikTokDownloader
   python main.py
   # 选择 Web API 接口模式
   ```
2. 配置环境变量:
   ```
   TIKTOK_DOWNLOADER_API_URL=http://127.0.0.1:5555
   ```
3. 修改API接口代码，调用真实后端服务

### Cookie配置
- 参考 TikTokDownloader 文档获取 Cookie
- Cookie 影响视频分辨率和可访问内容范围

## 构建与部署
- 开发环境: `pnpm dev` (端口5000)
- 构建: `pnpm build`
- 生产环境: `pnpm start`

## 法律声明
本工具仅供个人学习和研究使用，请遵守平台服务条款，不得用于商业用途。