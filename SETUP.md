# 安装和运行指南

## 📋 前置要求

在运行这个应用之前，你需要先安装 Node.js（包含 npm）。

## 🔧 安装 Node.js

### 方法一：从官网下载（推荐）

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐，更稳定）
3. 运行安装程序，按照提示完成安装
4. 安装完成后，重启命令行窗口

### 方法二：使用包管理器

如果你使用 Chocolatey：
```powershell
choco install nodejs
```

如果你使用 Winget：
```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ 验证安装

安装完成后，打开新的命令行窗口，运行以下命令验证：

```powershell
node --version
npm --version
```

如果显示版本号，说明安装成功！

## 🚀 运行项目

安装完 Node.js 后，在项目目录下运行：

```powershell
# 1. 进入项目目录
cd C:\Users\wag17423\weight-loss-app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动成功后，浏览器会自动打开，或者手动访问显示的地址（通常是 `http://localhost:5173`）

## 📝 其他命令

```powershell
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## ❓ 遇到问题？

- 如果 `npm` 命令不识别，请确保：
  1. Node.js 已正确安装
  2. 已重启命令行窗口
  3. Node.js 已添加到系统 PATH 环境变量中

- 如果安装依赖时出错，可以尝试：
  ```powershell
  npm cache clean --force
  npm install
  ```
