# 🍅 番茄钟 - 集简云/Notion/飞书集成指南

## 快速开始

### ① Notion 数据库集成

**目标**：将番茄钟任务和数据自动同步到 Notion

#### 步骤 1: 创建 Notion 集成

1. 访问 https://www.notion.so/my-integrations
2. 点击 "+ New integration"
3. 输入名称："番茄钟 Bot"
4. 提交并复制 **Internal Integration Token** (API Key)
5. 记下 Token，格式类似：`secret_xxxxxxxxxxxxx`

#### 步骤 2: 创建 Notion 数据库

1. 在 Notion 中打开任意页面
2. 点击 "+ New" → "Database" → "Table"
3. 设置以下属性：

| 属性名 | 类型 | 说明 |
|-------|------|------|
| 任务名称 | Title | 主属性（自动创建） |
| 状态 | Status | 选项：未完成、进行中、完成 |
| 关联番茄 | Number | 番茄数量 |
| 完成时间 | Date | 完成日期 |
| 优先级 | Select | 低、中、高 |
| 标签 | Multi-select | 自定义标签 |

4. 获取 Database ID：
   - 复制数据库 URL
   - 格式：`https://notion.so/workspace/{DATABASE_ID}?v=...`
   - DATABASE_ID 是中间的 32 个字符

#### 步骤 3: 在番茄钟中配置

1. 打开番茄钟应用
2. 滚动到"第三方集成"→"Notion 数据库"
3. 粘贴 API Key 到"Notion API Key"
4. 粘贴 Database ID 到"Database ID"
5. 点击"🔗 连接 Notion"
6. 连接成功后点击"同步到 Notion"

#### 步骤 4: 给 Integration 赋予权限

1. 返回 Notion 数据库
2. 点击右上角"..."→"Add connections"
3. 选择刚才创建的"番茄钟 Bot" Integration
4. 确认权限

✅ 完成！您的任务现在会同步到 Notion。

---

### ② 飞书集成

**目标**：将番茄钟统计报告发送到飞书群组

#### 步骤 1: 获取飞书 Webhook

1. 打开飞书应用或网页版：https://feishu.cn
2. 找到或创建一个群组
3. 点击群组设置（右上角）
4. 选择"开发者工具" → "Bot"
5. 点击"自定义机器人"或"Add bot"
6. 给机器人命名（如"番茄钟助手"）
7. 复制 **Webhook URL**，格式：
   ```
   https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxxxxxxx
   ```

#### 步骤 2: 在番茄钟中配置

1. 打开番茄钟应用
2. 滚动到"第三方集成"→"飞书"
3. 粘贴 Webhook URL 到"飞书 Webhook URL"
4. 勾选"启用飞书通知"
5. 点击"🚀 发送到飞书"

✅ 您的报告会以卡片形式发送到飞书！

#### 自动发送配置

使用飞书的定时消息或集简云：

```json
{
  "trigger": "每天 18:00",
  "action": "调用番茄钟数据 → 发送到飞书"
}
```

---

### ③ 集简云自动化工作流

**目标**：创建跨平台自动化，同步到多个应用

#### 支持的应用

- Google Sheets
- Airtable
- Slack
- Microsoft Teams
- Telegram
- Discord
- Mailchimp
- 企业微信
- 和数百个其他应用

#### 场景 1: 每日定时同步

```
触发: 每天 18:00 时间计划

动作 1: 调用 Webhook 获取番茄钟数据
  URL: https://your-pomodoro-url/pomodoro.html
  
动作 2: 数据转换
  完成番茄 → Google Sheets 列 A
  专注分钟 → Google Sheets 列 B
  完成任务 → Google Sheets 列 C
  
动作 3: 发送通知
  Slack: "@channel 📊 今日完成 {番茄数} 个番茄"
  飞书: 同上
  邮件: 日报邮件
```

#### 场景 2: 条件工作流

```
IF 完成番茄数 >= 4
  THEN:
    - 发送庆祝贴纸到飞书
    - 在 Google Calendar 标记为"高产力"
    - 发送 Slack 祝贺消息

IF 任务完成率 > 80%
  THEN:
    - 更新 Airtable 成就记录
    - 发送奖励提醒
```

#### 场景 3: 任务跨平台分发

```
触发: 完成工作时段

动作:
  1. 同步任务到 Notion
  2. 同步任务到飞书
  3. 同步任务到企业微信
  4. 更新 Google Calendar
  5. 保存到 Google Sheets
  6. 发送 Slack 通知
```

#### 快速配置步骤

1. **注册 Integromat**
   - 访问 https://www.integromat.com
   - 使用 Google/GitHub 账号注册

2. **创建场景**
   - 点击"Create a new scenario"
   - 选择名称（如"番茄钟每日同步"）

3. **添加触发器**
   - 搜索"Schedule"
   - 选择"每天的指定时间"
   - 设置时间（如 18:00）

4. **添加第一个操作**
   - 点击"+"添加操作
   - 搜索"Custom webhook"
   - 创建 Webhook 来获取番茄钟数据

5. **添加应用集成**
   - 搜索"Google Sheets"
   - 授权访问您的 Google Drive
   - 选择电子表格和工作表
   - 配置字段映射

6. **添加通知操作**
   - 搜索"Slack"或"飞书"
   - 授权并选择频道
   - 自定义消息内容

7. **测试并启用**
   - 点击"Run once"测试工作流
   - 如果成功，点击"Turn on"启用

---

## 📊 Webhook 数据格式

当番茄钟发送数据到集简云或其他 Webhook 时，数据格式如下：

```json
{
  "event": "work_completed|break_completed|task_completed|daily_summary",
  "timestamp": "2026-06-02T21:45:00+08:00",
  "pomodoro_count": 1,
  "total_minutes": 25,
  "tasks": [
    {
      "id": 1,
      "text": "完成报告",
      "completed": true,
      "pomodoros": 2
    }
  ],
  "stats": {
    "pomodorosCompleted": 5,
    "minutesWorked": 125,
    "tasksFinished": 3,
    "breaksCompleted": 4
  }
}
```

---

## 🔒 安全建议

1. **API Keys**: 不要在公开场合分享 API Key
2. **Webhooks**: 使用 HTTPS 加密传输
3. **权限**: 只给应用最小必要权限
4. **备份**: 定期备份重要数据到 Google Drive

---

## 🆘 常见问题

**Q: Notion 连接失败怎么办？**
A: 
- 检查 API Key 是否正确复制
- 确保 Integration 有数据库访问权限
- 检查网络连接

**Q: 飞书消息没有收到？**
A:
- 检查 Webhook URL 是否正确
- 确认机器人已添加到群组
- 检查浏览器控制台是否有错误

**Q: 如何修改自动同步间隔？**
A: 在"自动同步"部分设置秒数（0 为禁用）

**Q: 支持其他应用吗？**
A: 可以使用集简云或 Zapier 连接任何有 API 的应用

---

## 📞 更新和支持

- 定期检查新的集成选项
- 查看官方文档：
  - Notion: https://developers.notion.com
  - 飞书: https://open.feishu.cn
  - Integromat: https://www.integromat.com/docs

---

**🎉 享受番茄钟与您最喜欢的工具的无缝集成！**
