# 🍅 番茄钟 - 快速启动指南

## 📱 在手机上使用 - 3 种方式

### 方式 1️⃣：直接运行启动脚本（推荐）

**Windows 用户：**
```
双击运行: start_server.bat
```

**Mac/Linux 用户：**
```bash
chmod +x start_server.sh
./start_server.sh
```

脚本会自动：
✅ 检查 Python 环境
✅ 安装依赖包
✅ 启动 Web 服务器
✅ 显示访问 URL 和二维码

### 方式 2️⃣：命令行启动（高级用户）

```bash
# 最简单的启动方式
python3 run_server.py

# 指定端口（默认 8000）
python3 run_server.py 8080

# 允许所有网络接口访问
python3 run_server.py 8000 0.0.0.0
```

### 方式 3️⃣：Python 代码中集成

```python
from run_server import run_server

# 在 localhost 启动
run_server(host='localhost', port=8000)

# 允许局域网访问
run_server(host='0.0.0.0', port=8000)
```

---

## 🎯 启动后的步骤

### 步骤 1：获取访问地址
服务器启动时会显示：
```
📍 本地: http://localhost:8000/pomodoro.html
📍 局域网: http://192.168.1.100:8000/pomodoro.html
📍 信息页: http://192.168.1.100:8000/info
```

### 步骤 2：在手机打开
- **方式 A**：直接输入地址到手机浏览器
- **方式 B**：访问信息页面，扫描二维码
- **方式 C**：添加到主屏幕（iOS/Android）

### 步骤 3：开始使用
- ✅ 添加任务
- ✅ 开始计时
- ✅ 实时统计
- ✅ 一切同步到云端（通过集成功能）

---

## 🔍 文件说明

| 文件 | 用途 |
|------|------|
| `pomodoro.html` | 主应用界面 |
| `pomodoro.css` | 样式表（含响应式设计） |
| `pomodoro.js` | 逻辑和功能 |
| `manifest.json` | PWA 配置 |
| `service-worker.js` | 离线支持 |
| `run_server.py` | 网络服务器 |
| `start_server.bat` | Windows 启动脚本 |
| `start_server.sh` | Linux/Mac 启动脚本 |
| `NETWORK_GUIDE.md` | 详细网络指南 |
| `INTEGRATIONS.md` | 集成配置指南 |

---

## ✨ 核心功能

✅ **Web 应用** - 在浏览器中运行
✅ **PWA 应用** - 支持离线使用
✅ **响应式设计** - 完美适配手机
✅ **任务管理** - 添加和跟踪任务
✅ **数据导出** - CSV/Markdown/ICS
✅ **日历同步** - 导入到 Google Calendar
✅ **第三方集成** - Notion/飞书/集简云
✅ **Webhook 支持** - 自定义自动化
✅ **深色模式** - 护眼界面

---

## 🚀 快速命令参考

```bash
# 启动服务器（默认 localhost:8000）
python3 run_server.py

# 启动服务器（允许局域网访问）
python3 run_server.py 8000 0.0.0.0

# 启动服务器（自定义端口）
python3 run_server.py 9000

# 启动服务器（指定 IP）
python3 run_server.py 8000 192.168.1.100
```

---

## 📱 手机/平板访问

### iOS (iPhone/iPad)
1. Safari 中输入：`http://192.168.1.x:8000/pomodoro.html`
2. 分享 → 添加到主屏幕
3. 可作为应用使用

### Android
1. Chrome 中输入：`http://192.168.1.x:8000/pomodoro.html`
2. 菜单 → 安装应用 或 添加到主屏幕
3. 可作为应用使用

### 用二维码（最快）
访问 `http://192.168.1.x:8000/info` 扫描二维码

---

## 🔧 排查步骤

### 问题：手机无法连接

```
✅ 确认电脑和手机在同一 WiFi
✅ 确认服务器已启动（有蓝色输出）
✅ 检查 IP 地址是否正确
✅ 检查防火墙是否阻止 Python
✅ 确认端口未被占用
```

### 查看电脑 IP

**Windows：**
```
ipconfig | find "IPv4"
```

**Mac/Linux：**
```bash
hostname -I  # Linux
ifconfig     # Mac
```

---

## 💡 使用建议

1. **长期使用** → 安装 PWA（在应用菜单中选择"安装到桌面"）
2. **团队使用** → 在服务器上运行，分享 URL
3. **数据备份** → 每周导出 CSV 或 Markdown
4. **集成其他应用** → 使用 Webhook 或第三方集成

---

## 🎉 开始使用

**立即启动：**
- Windows: 双击 `start_server.bat`
- Mac/Linux: 运行 `./start_server.sh`

**然后在手机上打开：**
- 访问显示的 URL
- 或扫描二维码
- 开始使用番茄钟！

---

**祝您工作高效！🚀**
