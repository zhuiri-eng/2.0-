@echo off
echo 正在启动命理计算网页服务器...
echo.
echo 请选择启动方式：
echo 1. 使用Python启动（推荐）
echo 2. 使用Node.js启动
echo 3. 直接打开HTML文件
echo.
set /p choice=请输入选择 (1-3): 

if "%choice%"=="1" (
    echo 尝试使用Python启动服务器...
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Python已找到，启动服务器...
        python -m http.server 8000
    ) else (
        echo Python未找到，尝试使用py命令...
        py --version >nul 2>&1
        if %errorlevel% equ 0 (
            echo py命令可用，启动服务器...
            py -m http.server 8000
        ) else (
            echo 错误：未找到Python，请安装Python或选择其他选项
            pause
        )
    )
) else if "%choice%"=="2" (
    echo 尝试使用Node.js启动服务器...
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Node.js已找到，启动服务器...
        npx http-server -p 8000
    ) else (
        echo 错误：未找到Node.js，请安装Node.js或选择其他选项
        pause
    )
) else if "%choice%"=="3" (
    echo 直接打开HTML文件...
    start index.html
    echo HTML文件已打开，但某些功能可能需要本地服务器
    pause
) else (
    echo 无效选择
    pause
) 