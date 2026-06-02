#!/bin/bash
# 番茄钟 - Linux/Mac 启动脚本
# 在局域网上运行番茄钟应用

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║       🍅 番茄钟 - 启动网络服务器               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未检测到 Python 3"
    echo ""
    echo "请先安装 Python 3.7 或更高版本"
    echo "Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "macOS: brew install python3"
    echo ""
    exit 1
fi

echo "✅ Python 已安装: $(python3 --version)"

# 获取当前目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo ""
echo "📦 安装依赖..."
pip install qrcode[pil] -q 2>/dev/null || pip install qrcode pillow -q

# 获取本机 IP
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    LOCAL_IP="localhost"
fi

echo ""
echo "🚀 正在启动服务器..."
echo ""
echo "📱 访问地址:"
echo "   本地: http://localhost:8000/pomodoro.html"
echo "   局域网: http://$LOCAL_IP:8000/pomodoro.html"
echo "   信息页面: http://$LOCAL_IP:8000/info"
echo ""
echo "⚠️  按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 run_server.py 8000 0.0.0.0
