@echo off
REM 番茄钟 - Windows 一键启动脚本
REM 在局域网上运行番茄钟应用

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║       🍅 番茄钟 - 启动网络服务器               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Python
    echo.
    echo 请先安装 Python 3.7 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装

REM 获取当前目录
cd /d "%~dp0"

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo.
    echo 📦 创建 Python 虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖（如果需要）
echo.
echo 📦 安装依赖...
pip install qrcode[pil] -q

REM 获取本机 IP
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do set "GATEWAY=%%a"

echo.
echo 🚀 正在启动服务器...
echo.

REM 启动服务器
python run_server.py 8000 0.0.0.0

pause
