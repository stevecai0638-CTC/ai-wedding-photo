# 👰 AI 婚纱照生成器

一个集成真实AI技术的婚纱照生成应用，使用Next.js构建。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ 特性

- 🤖 **真实AI背景去除**：集成Hugging Face AI模型（完全免费）
- 🔥 **高级AI增强**：支持Remove.bg API（每月50张免费）
- 💻 **图像处理**：使用Sharp专业图像处理库
- 🎨 **现代UI**：Tailwind CSS，响应式设计
- 📱 **全平台支持**：Mac、Windows、移动端均可访问
- 🌐 **一键部署**：支持Vercel、Netlify免费部署

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
npm start
```

## 🌐 部署到Vercel（推荐）

### 方法1：通过Vercel网站部署

1. 将此项目推送到GitHub
2. 访问 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 点击 "Deploy"

等待2-3分钟，你将获得一个公开的URL！

### 方法2：通过Vercel CLI部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

## 🌐 部署到Netlify

1. 访问 [Netlify](https://netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 导入GitHub仓库
4. 构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. 点击 "Deploy site"

## 💡 使用说明

### 基本使用（完全免费）

1. 打开网站
2. 上传三张图片：
   - 👤 人物照片
   - 👗 婚纱图片
   - 🏞️ 背景场景
3. 点击 "✨ 生成婚纱照"
4. 等待AI处理（5-15秒）
5. 下载生成的图片

### 高级使用（可选增强）

1. 注册 [Remove.bg](https://www.remove.bg/zh/signup) 账号
2. 获取免费API密钥（每月50张）
3. 点击网站上的 "⚙️ AI设置"
4. 输入密钥
5. 重新生成，背景去除效果更精确！

## 🤖 AI服务说明

### Hugging Face AI（自动使用）
- **模型**：briaai/RMBG-1.4
- **功能**：智能背景去除
- **费用**：完全免费
- **使用**：自动调用，无需配置

### Remove.bg API（可选）
- **功能**：更精确的背景去除
- **费用**：每月50张免费
- **获取**：https://www.remove.bg/zh/signup
- **使用**：在AI设置中输入API密钥

## 🎨 技术栈

- **框架**：[Next.js 16](https://nextjs.org/) (App Router)
- **语言**：[TypeScript](https://www.typescriptlang.org/)
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **图像处理**：[Sharp](https://sharp.pixelplumbing.com/)
- **AI服务**：
  - [Hugging Face](https://huggingface.co/)（免费）
  - [Remove.bg](https://www.remove.bg/)（免费额度）
- **部署**：[Vercel](https://vercel.com/) / [Netlify](https://netlify.com/)

## 📁 项目结构

```
ai-wedding-photo/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # 图片处理API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
├── lib/
│   └── ai-image-processor.ts # AI图像处理
├── public/                    # 静态资源
├── package.json               # 依赖管理
└── README.md                  # 项目说明
```

## 🔧 开发

### 添加新功能

1. 修改 `app/page.tsx` 添加前端功能
2. 修改 `app/api/generate/route.ts` 添加后端处理逻辑
3. 运行 `npm run dev` 实时预览

### 代码规范

- 使用TypeScript
- 遵循Next.js最佳实践
- 使用Tailwind CSS进行样式设计

## 📝 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Sharp](https://sharp.pixelplumbing.com/) - 图像处理库
- [Hugging Face](https://huggingface.co/) - AI模型
- [Remove.bg](https://www.remove.bg/) - 背景去除API
- [Vercel](https://vercel.com/) - 部署平台

## 📞 支持

- 查看文档：https://www.feishu.cn/docx/MSGxdKoUJox6kRxY13LcTUu2n7b
- 问题反馈：提交Issue

---

享受创作美好的AI婚纱照！🎉
