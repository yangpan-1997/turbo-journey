#!/usr/bin/env python3
"""
番茄钟 ICS 日历订阅服务器脚本
用于生成实时的 ICS 日历文件，支持 Google Calendar、Outlook 等日历应用订阅

使用方法:
    python3 pomodoro_server.py
    
然后访问:
    http://localhost:8000/pomodoro-subscribe.ics
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime
import json
import urllib.parse
import os


class PomodoroICSHandler(SimpleHTTPRequestHandler):
    """处理番茄钟 ICS 订阅请求"""

    def do_GET(self):
        """处理 GET 请求"""
        if self.path == '/pomodoro-subscribe.ics':
            self.serve_pomodoro_ics()
        elif self.path == '/api/pomodoro-data':
            self.serve_json_api()
        else:
            super().do_GET()

    def serve_pomodoro_ics(self):
        """生成并返回 ICS 日历文件"""
        ics_content = self.generate_ics()

        self.send_response(200)
        self.send_header('Content-Type', 'text/calendar; charset=utf-8')
        self.send_header('Content-Disposition', 'attachment; filename="pomodoro-calendar.ics"')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.end_headers()

        self.wfile.write(ics_content.encode('utf-8'))

    def serve_json_api(self):
        """返回 JSON 格式的数据（用于 AJAX 请求）"""
        data = {
            "status": "ok",
            "message": "番茄钟 API 服务运行中",
            "features": [
                "导出为 CSV",
                "导出为 Markdown",
                "导出为 ICS 日历",
                "日历订阅",
                "PWA 桌面安装",
                "Webhook 集成"
            ],
            "endpoints": {
                "subscribe": "/pomodoro-subscribe.ics",
                "api": "/api/pomodoro-data"
            }
        }

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))

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
        ics += 'REFRESH-INTERVAL;VALUE=DURATION:PT1H\n'
        ics += f'LAST-MODIFIED:{now.isoformat()}Z\n'

        # 示例事件：每日番茄工作时间块
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
            ics += f'DESCRIPTION:第 {i + 1} 个番茄工作时间块\\n\\n提示: 这是一个示例事件，请在应用中添加具体任务。\n'
            ics += f'LOCATION:您的工作地点\n'
            ics += 'CATEGORIES:番茄钟,工作\n'
            ics += 'PRIORITY:5\n'
            ics += 'STATUS:TENTATIVE\n'
            ics += f'TRANSP:OPAQUE\n'
            ics += 'END:VEVENT\n'

        # 添加休息提醒
        break_time = '17:00'
        ics += 'BEGIN:VEVENT\n'
        ics += f'UID:break-daily@pomodoro-timer.local\n'
        ics += f'DTSTAMP:{now.isoformat().replace("-", "").replace(":", "").split(".")[0]}Z\n'
        ics += f'DTSTART:{today_string}T{break_time.replace(":", "")}00\n'
        ics += f'DTEND:{today_string}T{(int(break_time.split(":")[0]) + 1):02d}0000\n'
        ics += 'SUMMARY:☕ 每日休息总结\n'
        ics += 'DESCRIPTION:检查今日的番茄钟统计\\n✓ 完成多少个番茄？\\n✓ 完成了哪些任务？\\n✓ 明天的目标是什么？\n'
        ics += 'LOCATION:番茄钟应用\n'
        ics += 'CATEGORIES:番茄钟,休息,总结\n'
        ics += 'PRIORITY:3\n'
        ics += 'END:VEVENT\n'

        ics += 'END:VCALENDAR'
        return ics

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] {format % args}')


def run_server(host='localhost', port=8000):
    """运行 HTTP 服务器"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, PomodoroICSHandler)

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║        🍅 番茄钟 ICS 日历订阅服务器已启动                    ║
╚══════════════════════════════════════════════════════════════╝

📍 服务器地址: http://{host}:{port}

🔗 可访问的端点:

  1. 日历订阅:
     http://{host}:{port}/pomodoro-subscribe.ics
     ➜ 在日历应用中添加此 URL 以订阅

  2. JSON API:
     http://{host}:{port}/api/pomodoro-data
     ➜ 返回 API 端点信息

  3. 静态文件:
     http://{host}:{port}/pomodoro.html
     ➜ 打开 Web 应用

📅 导入到不同日历应用:

  Google Calendar:
    • 打开 Google Calendar
    • 点击 "+" → 订阅日历
    • 粘贴此 URL: http://{host}:{port}/pomodoro-subscribe.ics

  Microsoft Outlook:
    • 添加日历 → 订阅日历
    • 输入此 URL: http://{host}:{port}/pomodoro-subscribe.ics

  Apple Calendar:
    • 文件 → 导入
    • 选择导出的 ICS 文件

⚠️  按 Ctrl+C 停止服务器

""")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n✅ 服务器已停止')
        httpd.server_close()


if __name__ == '__main__':
    import sys

    host = 'localhost'
    port = 8000

    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    if len(sys.argv) > 2:
        host = sys.argv[2]

    run_server(host, port)
