@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 启动真实支付API系统
echo ========================================
echo.
echo 📋 支付配置信息:
echo    - 支付网关: https://pay.payma.cn/
echo    - 商户ID: 145297917
echo    - 商户密钥: AeYM3mCbR1NK420b9MZAY105yEm2ccbu
echo.
echo 🔧 正在启动支付API服务器...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖检查完成
echo.
echo 🌐 启动支付API服务器...
echo 📍 服务地址: http://localhost:3000
echo 📄 测试页面: http://localhost:3000/real-payment-test.html
echo.
echo 💡 提示:
echo    - 按 Ctrl+C 停止服务器
echo    - 支付回调地址: http://localhost:3000/api/payment-notify
echo    - 支付返回地址: http://localhost:3000/api/payment-return
echo.
echo ========================================

REM 启动服务器
npm start

pause 