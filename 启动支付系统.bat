@echo off
chcp 65001 >nul
title 自动化收款系统 - Payma支付

echo.
echo ========================================
echo    🚀 自动化收款系统启动程序
echo ========================================
echo.

echo 📋 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js环境正常

echo.
echo 📦 安装依赖包...
npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

echo.
echo 🌐 启动支付API服务器...
echo 📍 服务地址: http://localhost:3000
echo 📋 API文档: http://localhost:3000/api/health
echo.

start http://localhost:3000/api/health

echo 🚀 启动服务器...
node payment-api.js

pause 