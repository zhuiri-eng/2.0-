@echo off
chcp 65001 >nul
echo.
echo 🚀 支付系统密钥更新部署工具
echo ================================
echo.
echo 📋 更新内容:
echo    - 支付网关: https://pay.payma.cn/
echo    - 商户ID: 145297917
echo    - 商户密钥: AeYM3mCbR1NK420b9MZAY105yEm2ccbu
echo.
echo 🔧 正在检查文件更新...
echo.

REM 检查关键文件是否存在
if not exist "命理支付页面.html" (
    echo ❌ 错误: 找不到主支付页面文件
    pause
    exit /b 1
)

if not exist "payment-api.js" (
    echo ❌ 错误: 找不到支付API文件
    pause
    exit /b 1
)

echo ✅ 文件检查完成
echo.

echo 📦 准备部署到Netlify...
echo.

REM 检查是否安装了git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装Git，请先安装Git
    echo 💡 下载地址: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM 检查是否安装了netlify-cli
netlify --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未安装Netlify CLI，正在安装...
    npm install -g netlify-cli
    if errorlevel 1 (
        echo ❌ 安装Netlify CLI失败
        pause
        exit /b 1
    )
)

echo ✅ 环境检查完成
echo.

echo 🔄 正在初始化Git仓库...
if not exist ".git" (
    git init
    git add .
    git commit -m "初始化支付系统 - 更新Payma密钥"
) else (
    git add .
    git commit -m "更新Payma API密钥: AeYM3mCbR1NK420b9MZAY105yEm2ccbu"
)

echo.
echo 🌐 正在部署到Netlify...
echo 💡 如果是首次部署，请按照提示登录Netlify账户
echo.

netlify deploy --prod

if errorlevel 1 (
    echo.
    echo ❌ 部署失败，请检查错误信息
    echo 💡 您也可以手动部署:
    echo    1. 访问 https://app.netlify.com/
    echo    2. 点击 "New site from Git"
    echo    3. 选择您的Git仓库
    echo    4. 设置构建命令为空，发布目录为 "."
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功！
echo.
echo 📋 部署完成后的操作:
echo    1. 测试支付功能是否正常
echo    2. 检查支付回调是否正常
echo    3. 验证签名生成是否正确
echo.
echo 🔗 您的网站地址将显示在上方
echo.
pause
