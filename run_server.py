#!/usr/bin/env python3
"""
🍅 番茄钟 - 完整网络服务器
支持 PWA、ICS 日历、Webhook、跨平台访问

使用方法:
    python3 run_server.py              # 在 localhost:8000 启动
    python3 run_server.py 8080         # 指定端口
    python3 run_server.py 8080 0.0.0.0  # 在所有网络接口启动（局域网访问）

然后访问:
    本地: http://localhost:8000/pomodoro.html
    局域网: http://<您的IP>:8000/pomodoro.html
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime, timedelta
import json
import socket
import sys
import os
import html


class PomodoroHTTPHandler(SimpleHTTPRequestHandler):
    """处理番茄钟请求的 HTTP 处理器"""

    def do_GET(self):
        """处理 GET 请求"""
        if self.path == '/':
            self.path = '/pomodoro.html'
        
        # ICS 日历文件
        if self.path == '/pomodoro-subscribe.ics':
            self.serve_pomodoro_ics()
        # JSON API
        elif self.path == '/api/pomodoro-data':
            self.serve_json_api()
        # QR 码生成
        elif self.path == '/api/qr-code':
            self.serve_qr_code()
        # 信息页面
        elif self.path == '/info':
            self.serve_info_page()
        # 健康检查
        elif self.path == '/health':
            self.serve_health_check()
        else:
            # 提供静态文件
            super().do_GET()

    def serve_pomodoro_ics(self):
        """生成并返回 ICS 日历文件"""
        ics_content = self.generate_ics()

        self.send_response(200)
        self.send_header('Content-Type', 'text/calendar; charset=utf-8')
        self.send_header('Content-Disposition', 'attachment; filename="pomodoro-calendar.ics"')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(ics_content.encode('utf-8'))

    def serve_json_api(self):
        """返回 JSON 格式的数据"""
        data = {
            "status": "ok",
            "message": "番茄钟 API 服务运行中",
            "timestamp": datetime.now().isoformat(),
            "features": [
                "PWA 桌面应用",
                "ICS 日历导出",
                "Notion 集成",
                "飞书集成",
                "Webhook 支持",
                "自动同步"
            ],
            "endpoints": {
                "app": "/pomodoro.html",
                "calendar": "/pomodoro-subscribe.ics",
                "info": "/info",
                "health": "/health",
                "qr": "/api/qr-code"
            },
            "server_info": {
                "hostname": socket.gethostname(),
                "local_ip": get_local_ip(),
                "port": self.server.server_port
            }
        }

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))

    def serve_qr_code(self):
        """生成 QR 码用于手机访问"""
        try:
            import qrcode
            
            # 生成访问 URL
            local_ip = get_local_ip()
            port = self.server.server_port
            url = f"http://{local_ip}:{port}/pomodoro.html"
            
            # 生成 QR 码
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # 保存为 PNG
            img_byte_arr = bytes()
            img.save(BytesIO(img_byte_arr := bytearray()))
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(img_byte_arr)
        except ImportError:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            data = {
                "error": "qrcode 模块未安装",
                "install": "pip install qrcode[pil]",
                "url": f"http://{get_local_ip()}:{self.server.server_port}/pomodoro.html"
            }
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def serve_info_page(self):
        """提供友好的信息页面"""
        local_ip = get_local_ip()
        port = self.server.server_port
        
        html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍅 番茄钟 - 服务器信息</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .container {{
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
        }}
        h1 {{
            color: #ff6b6b;
            margin-bottom: 30px;
            text-align: center;
            font-size: 2.5em;
        }}
        .section {{
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #ff6b6b;
        }}
        .section h2 {{
            color: #2c3e50;
            font-size: 1.3em;
            margin-bottom: 15px;
        }}
        .access-url {{
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
            word-break: break-all;
            border: 1px solid #e0e0e0;
        }}
        .access-url a {{
            color: #ff6b6b;
            text-decoration: none;
            font-weight: bold;
        }}
        .access-url a:hover {{
            text-decoration: underline;
        }}
        .btn {{
            display: inline-block;
            padding: 12px 24px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            text-decoration: none;
            margin: 10px 5px;
            transition: background 0.3s;
        }}
        .btn:hover {{
            background: #ff5252;
        }}
        .btn-group {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }}
        .info-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
        }}
        .info-item {{
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }}
        .info-item label {{
            font-weight: bold;
            color: #2c3e50;
            display: block;
            margin-bottom: 5px;
        }}
        .info-item value {{
            color: #666;
            font-family: monospace;
            font-size: 0.9em;
        }}
        .qr-code {{
            text-align: center;
            margin: 20px 0;
        }}
        .qr-code img {{
            max-width: 300px;
            border: 2px solid #ff6b6b;
            border-radius: 10px;
            padding: 10px;
            background: white;
        }}
        .feature-list {{
            list-style: none;
            padding: 0;
        }}
        .feature-list li {{
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }}
        .feature-list li:before {{
            content: "✅ ";
            color: #51cf66;
            margin-right: 10px;
        }}
        .feature-list li:last-child {{
            border-bottom: none;
        }}
        @media (max-width: 600px) {{
            .container {{
                padding: 20px;
            }}
            h1 {{
                font-size: 1.8em;
            }}
            .info-grid {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🍅 番茄钟</h1>
        
        <div class="section">
            <h2>📱 访问地址</h2>
            <div class="access-url">
                <a href="http://{local_ip}:{port}/pomodoro.html" target="_blank">
                    http://{local_ip}:{port}/pomodoro.html
                </a>
            </div>
            <p style="color: #666; font-size: 0.9em; margin-top: 10px;">
                💡 在手机上输入上方网址，或扫描下方二维码
            </p>
        </div>

        <div class="section qr-code">
            <h2>📲 手机扫描二维码</h2>
            <img src="/api/qr-code" alt="QR Code" style="max-width: 250px;">
        </div>

        <div class="section">
            <h2>🖥️ 服务器信息</h2>
            <div class="info-grid">
                <div class="info-item">
                    <label>主机名</label>
                    <value>{socket.gethostname()}</value>
                </div>
                <div class="info-item">
                    <label>IP 地址</label>
                    <value>{local_ip}</value>
                </div>
                <div class="info-item">
                    <label>端口</label>
                    <value>{port}</value>
                </div>
                <div class="info-item">
                    <label>时间</label>
                    <value>{datetime.now().strftime('%H:%M:%S')}</value>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>✨ 功能特性</h2>
            <ul class="feature-list">
                <li>PWA 应用 - 可离线使用和桌面安装</li>
                <li>任务管理 - 添加、编辑、跟踪任务</li>
                <li>数据导出 - CSV、Markdown、ICS 格式</li>
                <li>第三方集成 - Notion、飞书、集简云</li>
                <li>Webhook 支持 - 自定义自动化</li>
                <li>日历同步 - 导入到 Google Calendar、Outlook</li>
                <li>深色模式 - 护眼舒适界面</li>
                <li>响应式设计 - 完美支持手机平板</li>
            </ul>
        </div>

        <div class="section">
            <h2>🚀 快速开始</h2>
            <div class="btn-group">
                <a href="/pomodoro.html" class="btn">打开应用</a>
                <a href="/pomodoro-subscribe.ics" class="btn">导出日历</a>
                <a href="/api/pomodoro-data" class="btn">API 数据</a>
            </div>
        </div>

        <div class="section" style="background: #fff3cd; border-left-color: #ffc107;">
            <h2>💡 使用提示</h2>
            <ul style="padding-left: 20px; color: #333;">
                <li>在设置中启用 PWA 安装，可在桌面上使用</li>
                <li>使用 Webhook 与第三方工具自动化工作流</li>
                <li>定期导出数据，备份您的任务和统计</li>
                <li>在多个设备上共享此网址，团队协作</li>
            </ul>
        </div>
    </div>
</body>
</html>
"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))

    def serve_health_check(self):
        """健康检查端点"""
        data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "uptime": "running"
        }
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def generate_ics(self):
        """生成 ICS 日历内容"""
        now = datetime.now()
        today_string = now.strftime('%Y%m%d')

        ics = 'BEGIN:VCALENDAR\n'
        ics += 'VERSION:2.0\n'
        ics += 'PRODID:-//番茄钟 Pomodoro Timer//CN\n'
        ics += 'CALSCALE:GREGORIAN\n'
        ics += f'X-WR-CALNAME:番茄钟 - 每日任务和统计\n'
        ics += 'X-WR-TIMEZONE:Asia/Shanghai\n'
        ics += 'X-WR-CALDESC:番茄工作法应用 - 实时任务和统计同步\n'
        ics += 'METHOD:PUBLISH\n'

        for i in range(4):
            start_hour = 9 + (i * 2)
            event_date = today_string
            event_time = f'{start_hour:02d}0000'
            event_end_time = f'{start_hour + 1:02d}0000'

            ics += 'BEGIN:VEVENT\n'
            ics += f'UID:pomodoro-{i}@pomodoro-timer.local\n'
            ics += f'DTSTAMP:{now.isoformat().replace("-", "").replace(":", "").split(".")[0]}Z\n'
            ics += f'DTSTART:{event_date}T{event_time}\n'
            ics += f'DTEND:{event_date}T{event_end_time}\n'
            ics += f'SUMMARY:🍅 番茄工作 #{i + 1}\n'
            ics += f'DESCRIPTION:第 {i + 1} 个番茄工作时间块\n'
            ics += 'END:VEVENT\n'

        ics += 'END:VCALENDAR'
        return ics

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] {format % args}')


def get_local_ip():
    """获取本地 IP 地址"""
    try:
        # 连接到公网 DNS，无需实际连接
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def run_server(host='localhost', port=8000):
    """运行 HTTP 服务器"""
    # 获取实际使用的 IP
    actual_ip = get_local_ip() if host == '0.0.0.0' else host
    
    server_address = (host, port)
    httpd = HTTPServer(server_address, PomodoroHTTPHandler)

    print(f"""
╔════════════════════════════════════════════════════════════════╗
║          🍅 番茄钟 Web 服务器已启动                           ║
╚════════════════════════════════════════════════════════════════╝

🖥️  服务器地址: http://{host}:{port}

📱 访问地址:
   本地访问:  http://localhost:{port}/pomodoro.html
   局域网访问: http://{actual_ip}:{port}/pomodoro.html

📊 其他端点:
   信息页面: http://{actual_ip}:{port}/info
   日历订阅: http://{actual_ip}:{port}/pomodoro-subscribe.ics
   API 数据: http://{actual_ip}:{port}/api/pomodoro-data
   健康检查: http://{actual_ip}:{port}/health
   二维码: http://{actual_ip}:{port}/api/qr-code

📲 手机使用:
   1️⃣  在手机浏览器中输入上方 URL
   2️⃣  或打开浏览器并访问: http://{actual_ip}:{port}/info
   3️⃣  扫描页面上的二维码快速访问

🔧 安装依赖（可选）:
   pip install qrcode[pil]  # 用于生成二维码

⚠️  按 Ctrl+C 停止服务器

""")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n✅ 服务器已停止')
        httpd.server_close()


if __name__ == '__main__':
    host = 'localhost'
    port = 8000

    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    if len(sys.argv) > 2:
        host = sys.argv[2]

    run_server(host, port)
