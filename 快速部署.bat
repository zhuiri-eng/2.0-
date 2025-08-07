@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 支付系统快速部署工具
echo ========================================
echo.

echo 📋 检查部署文件...
if not exist "index.html" (
    echo ❌ 错误：找不到 index.html 文件
    pause
    exit /b 1
)

if not exist "纯前端支付.html" (
    echo ❌ 错误：找不到 纯前端支付.html 文件
    pause
    exit /b 1
)

if not exist "netlify.toml" (
    echo ❌ 错误：找不到 netlify.toml 配置文件
    pause
    exit /b 1
)

echo ✅ 所有必要文件检查完成
echo.

echo 📁 准备部署文件列表：
echo.
echo 主要文件：
echo   - index.html (主页面，已集成支付)
echo   - 纯前端支付.html (独立支付页面)
echo   - netlify.toml (部署配置)
echo   - styles.css (样式文件)
echo   - script.js (脚本文件)
echo.
echo 其他文件：
echo   - 支付系统部署指南.md (部署说明)
echo   - 问题解决方案.md (问题解决)
echo   - README.md (项目说明)
echo.

echo 🚀 部署方案选择：
echo.
echo 1. 拖拽部署到 Netlify (推荐，最简单)
echo 2. GitHub 部署 (需要 Git 仓库)
echo 3. 查看部署指南
echo 4. 退出
echo.

set /p choice="请选择部署方案 (1-4): "

if "%choice%"=="1" goto drag_deploy
if "%choice%"=="2" goto github_deploy
if "%choice%"=="3" goto show_guide
if "%choice%"=="4" goto exit
goto invalid_choice

:drag_deploy
echo.
echo ========================================
echo 🎯 拖拽部署到 Netlify
echo ========================================
echo.
echo 📋 部署步骤：
echo.
echo 1. 打开浏览器，访问：https://app.netlify.com/
echo 2. 登录或注册 Netlify 账号
echo 3. 将整个项目文件夹拖拽到 Netlify 的部署区域
echo 4. 等待部署完成（约1-2分钟）
echo.
echo 📁 需要拖拽的文件夹：%cd%
echo.
echo ⚠️  注意：确保拖拽的是整个项目文件夹，不是单个文件
echo.
echo 🔗 部署完成后，您将获得一个 Netlify 域名
echo    例如：https://your-site-name.netlify.app/
echo.
echo 🧪 测试链接：
echo    - 主页面：https://your-site-name.netlify.app/
echo    - 独立支付：https://your-site-name.netlify.app/纯前端支付.html
echo.
pause
goto exit

:github_deploy
echo.
echo ========================================
echo 🔗 GitHub 部署
echo ========================================
echo.
echo 📋 部署步骤：
echo.
echo 1. 创建 GitHub 仓库
echo 2. 上传项目文件到 GitHub
echo 3. 在 Netlify 中连接 GitHub 仓库
echo 4. 设置构建命令为空，发布目录为 .
echo 5. 点击部署
echo.
echo 💡 如果您还没有 Git 仓库，建议使用拖拽部署方案
echo.
pause
goto exit

:show_guide
echo.
echo ========================================
echo 📖 部署指南
echo ========================================
echo.
echo 📄 详细部署指南已保存为：支付系统部署指南.md
echo.
echo 🔍 快速查看指南内容：
echo.
echo 📋 部署方案：
echo   - 方案一：纯前端部署（推荐，无需服务器）
echo   - 方案二：完整系统部署（需要服务器）
echo.
echo 🎯 推荐使用方案一：纯前端部署
echo   ✅ 简单快速，无需服务器
echo   ✅ 直接部署到 Netlify
echo   ✅ 支付功能完全正常
echo   ✅ 适合大多数用户
echo.
echo 🧪 部署后测试：
echo   - 页面正常加载
echo   - 表单填写正常
echo   - 支付跳转正常
echo   - 微信中功能正常
echo.
pause
goto exit

:invalid_choice
echo.
echo ❌ 无效选择，请输入 1-4
echo.
pause
goto exit

:exit
echo.
echo ========================================
echo 🎉 部署指南完成
echo ========================================
echo.
echo 📞 如果遇到问题，请查看：
echo   - 支付系统部署指南.md
echo   - 问题解决方案.md
echo.
echo 🚀 祝您部署成功！
echo.
pause 