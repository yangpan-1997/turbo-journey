// DOM 元素引用
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const modeText = document.getElementById('modeText');
const sessionCount = document.getElementById('sessionCount');
const progressRing = document.getElementById('progressRing');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const noTasks = document.getElementById('noTasks');
const soundCheckbox = document.getElementById('soundEnabled');
const notificationCheckbox = document.getElementById('notificationEnabled');
const titleNotificationCheckbox = document.getElementById('titleNotificationEnabled');
const darkModeCheckbox = document.getElementById('darkMode');
const workDurationInput = document.getElementById('workDuration');
const breakDurationInput = document.getElementById('breakDuration');
const longBreakDurationInput = document.getElementById('longBreakDuration');
const longBreakEnabledCheckbox = document.getElementById('longBreakEnabled');
const timerSection = document.querySelector('.timer-section');
const notificationSound = document.getElementById('notificationSound');
const webhookUrlInput = document.getElementById('webhookUrl');
const webhookEnabledCheckbox = document.getElementById('webhookEnabled');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
const exportIcsBtn = document.getElementById('exportIcsBtn');
const subscribeIcsBtn = document.getElementById('subscribeIcsBtn');
const installPwaBtn = document.getElementById('installPwaBtn');

// 集成相关元素
const notionApiKey = document.getElementById('notionApiKey');
const notionDatabaseId = document.getElementById('notionDatabaseId');
const notionEnabled = document.getElementById('notionEnabled');
const notionConnectBtn = document.getElementById('notionConnectBtn');
const notionTemplateBtn = document.getElementById('notionTemplateBtn');
const syncToNotionBtn = document.getElementById('syncToNotionBtn');
const notionStatus = document.getElementById('notionStatus');

const feishuWebhook = document.getElementById('feishuWebhook');
const feishuEnabled = document.getElementById('feishuEnabled');
const feishuTemplateBtn = document.getElementById('feishuTemplateBtn');
const syncToFeishuBtn = document.getElementById('syncToFeishuBtn');
const feishuStatus = document.getElementById('feishuStatus');

const jibeCloudTemplateBtn = document.getElementById('jibeCloudTemplateBtn');
const exportWebhookConfigBtn = document.getElementById('exportWebhookConfigBtn');
const jibeCloudStatus = document.getElementById('jibeCloudStatus');

const autoSyncInterval = document.getElementById('autoSyncInterval');
const syncStatus = document.getElementById('syncStatus');

let autoSyncTimer = null;

// 统计元素
const todayPomodoros = document.getElementById('todayPomodoros');
const totalMinutes = document.getElementById('totalMinutes');
const tasksCompleted = document.getElementById('tasksCompleted');
const breakCount = document.getElementById('breakCount');
const clearStatsBtn = document.getElementById('clearStatsBtn');

// 状态变量
let isRunning = false;
let isWorkTime = true;
let timeLeft = 25 * 60;
let totalTimeInPhase = 25 * 60;
let sessionNum = 1;
let pomodorosCompleted = 0;
let breaksCompleted = 0;
let minutesWorked = 0;
let tasksFinished = 0;

// 任务列表
let tasks = [];
let taskIdCounter = 0;

// 初始化
function init() {
    loadSettings();
    loadStats();
    loadTasks();
    updateDisplay();
    setupEventListeners();
    applyDarkMode();
    
    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// 设置事件监听
function setupEventListeners() {
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    soundCheckbox.addEventListener('change', () => {
        localStorage.setItem('soundEnabled', soundCheckbox.checked);
    });
    
    notificationCheckbox.addEventListener('change', () => {
        localStorage.setItem('notificationEnabled', notificationCheckbox.checked);
    });
    
    titleNotificationCheckbox.addEventListener('change', () => {
        localStorage.setItem('titleNotificationEnabled', titleNotificationCheckbox.checked);
    });
    
    darkModeCheckbox.addEventListener('change', () => {
        localStorage.setItem('darkMode', darkModeCheckbox.checked);
        applyDarkMode();
    });
    
    webhookUrlInput.addEventListener('change', () => {
        localStorage.setItem('webhookUrl', webhookUrlInput.value);
    });
    
    webhookEnabledCheckbox.addEventListener('change', () => {
        localStorage.setItem('webhookEnabled', webhookEnabledCheckbox.checked);
    });
    
    exportIcsBtn.addEventListener('click', exportAsICS);
    subscribeIcsBtn.addEventListener('click', showIcsSubscribeInfo);
    installPwaBtn.addEventListener('click', installPWA);
    
    // Notion 集成
    notionConnectBtn.addEventListener('click', connectNotion);
    notionTemplateBtn.addEventListener('click', showNotionTemplate);
    syncToNotionBtn.addEventListener('click', syncToNotion);
    notionEnabled.addEventListener('change', () => {
        localStorage.setItem('notionEnabled', notionEnabled.checked);
    });
    
    // 飞书集成
    feishuTemplateBtn.addEventListener('click', showFeishuTemplate);
    syncToFeishuBtn.addEventListener('click', syncToFeishu);
    feishuEnabled.addEventListener('change', () => {
        localStorage.setItem('feishuEnabled', feishuEnabled.checked);
    });
    
    // 集简云
    jibeCloudTemplateBtn.addEventListener('click', showJibeCloudTemplate);
    exportWebhookConfigBtn.addEventListener('click', exportWebhookConfig);
    
    // 自动同步
    autoSyncInterval.addEventListener('change', setupAutoSync);
    
    workDurationInput.addEventListener('change', () => {
        localStorage.setItem('workDuration', workDurationInput.value);
        if (!isRunning && isWorkTime) {
            timeLeft = workDurationInput.value * 60;
            totalTimeInPhase = timeLeft;
            updateDisplay();
        }
    });
    
    breakDurationInput.addEventListener('change', () => {
        localStorage.setItem('breakDuration', breakDurationInput.value);
        if (!isRunning && !isWorkTime && !isLongBreak()) {
            timeLeft = breakDurationInput.value * 60;
            totalTimeInPhase = timeLeft;
            updateDisplay();
        }
    });
    
    longBreakDurationInput.addEventListener('change', () => {
        localStorage.setItem('longBreakDuration', longBreakDurationInput.value);
        if (!isRunning && !isWorkTime && isLongBreak()) {
            timeLeft = longBreakDurationInput.value * 60;
            totalTimeInPhase = timeLeft;
            updateDisplay();
        }
    });
    
    longBreakEnabledCheckbox.addEventListener('change', () => {
        localStorage.setItem('longBreakEnabled', longBreakEnabledCheckbox.checked);
    });
    
    clearStatsBtn.addEventListener('click', clearStats);
}

// 深色模式切换
function applyDarkMode() {
    if (darkModeCheckbox.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// 开始计时
function start() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerSection.classList.add('active');
    
    const interval = setInterval(() => {
        if (!isRunning) {
            clearInterval(interval);
            return;
        }
        
        timeLeft--;
        
        if (timeLeft <= 0) {
            completePhase();
            clearInterval(interval);
        }
        
        updateDisplay();
    }, 1000);
}

// 暂停计时
function pause() {
    isRunning = false;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    timerSection.classList.remove('active');
}

// 重置计时
function reset() {
    isRunning = false;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    timerSection.classList.remove('active');
    
    if (isWorkTime) {
        timeLeft = workDurationInput.value * 60;
    } else {
        timeLeft = isLongBreak() 
            ? longBreakDurationInput.value * 60 
            : breakDurationInput.value * 60;
    }
    totalTimeInPhase = timeLeft;
    updateDisplay();
}

// 检查是否是长休息
function isLongBreak() {
    return longBreakEnabledCheckbox.checked && sessionNum % 4 === 0;
}

// 完成一个阶段
function completePhase() {
    isRunning = false;
    timerSection.classList.remove('active');
    
    let notificationTitle = '';
    let notificationBody = '';
    let webhookData = {};
    
    if (isWorkTime) {
        pomodorosCompleted++;
        minutesWorked += workDurationInput.value;
        playNotification();
        
        notificationTitle = '✅ 专注时间结束！';
        notificationBody = `完成了第 ${sessionNum} 个番茄。休息一下吧。`;
        
        webhookData = {
            event: 'work_completed',
            pomodoro_count: sessionNum,
            total_minutes: minutesWorked,
            timestamp: new Date().toISOString()
        };
        
        showNotification(notificationTitle, notificationBody);
        
        // 自动切换到休息
        isWorkTime = false;
        timeLeft = isLongBreak() 
            ? longBreakDurationInput.value * 60 
            : breakDurationInput.value * 60;
    } else {
        breaksCompleted++;
        playNotification();
        
        const breakType = isLongBreak() ? '长休息' : '短休息';
        notificationTitle = '⏰ ' + breakType + '时间结束！';
        notificationBody = '准备好开始下一个番茄了吗？';
        
        webhookData = {
            event: 'break_completed',
            break_type: isLongBreak() ? 'long' : 'short',
            pomodoro_number: sessionNum,
            timestamp: new Date().toISOString()
        };
        
        showNotification(notificationTitle, notificationBody);
        
        // 自动切换到工作
        isWorkTime = true;
        sessionNum++;
        timeLeft = workDurationInput.value * 60;
    }
    
    totalTimeInPhase = timeLeft;
    updateDisplay();
    saveStats();
    
    // 发送 Webhook
    if (webhookEnabledCheckbox.checked && webhookUrlInput.value.trim()) {
        sendWebhook(webhookData);
    }
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 播放通知音
function playNotification() {
    if (!soundCheckbox.checked) return;
    
    // 生成简单的哔哔声
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 显示浏览器通知
function showNotification(title, body) {
    if (!notificationCheckbox.checked || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        new Notification(title || '番茄钟', {
            body: body || title,
            icon: '🍅',
            tag: 'pomodoro-notification',
            requireInteraction: false
        });
    }
}

// 发送 Webhook
function sendWebhook(data) {
    const webhookUrl = webhookUrlInput.value.trim();
    if (!webhookUrl) return;
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(error => {
        console.log('Webhook 发送失败:', error);
    });
}

// 更新显示
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    
    modeText.textContent = isWorkTime ? '专注时间' : '休息时间';
    sessionCount.textContent = `第 ${sessionNum} 番茄`;
    
    // 更新进度环
    const circumference = 2 * Math.PI * 130;
    const offset = circumference - (timeLeft / totalTimeInPhase) * circumference;
    progressRing.style.strokeDashoffset = offset;
    
    // 改变颜色
    if (isWorkTime) {
        progressRing.style.stroke = 'var(--primary-color)';
    } else {
        progressRing.style.stroke = 'var(--secondary-color)';
    }
    
    // 更新标题 - 支持倒计时显示
    if (titleNotificationCheckbox.checked && isRunning) {
        const modeLabel = isWorkTime ? '🍅' : '☕';
        document.title = `${modeLabel} ${minutesDisplay.textContent}:${secondsDisplay.textContent} - 番茄钟`;
    } else {
        document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - 番茄钟`;
    }
}

// 任务管理
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    const task = {
        id: taskIdCounter++,
        text: taskText,
        completed: false,
        pomodoros: 0
    };
    
    tasks.push(task);
    taskInput.value = '';
    renderTasks();
    saveTasks();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            tasksFinished++;
        } else {
            tasksFinished--;
        }
        renderTasks();
        saveTasks();
        saveStats();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    saveTasks();
}

function associateTaskWithPomodoro() {
    // 当完成工作时段时，关联到当前任务
    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length > 0) {
        incompleteTasks[0].pomodoros++;
    }
}

function renderTasks() {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        noTasks.style.display = 'block';
        return;
    }
    
    noTasks.style.display = 'none';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            ${task.pomodoros > 0 ? `<span class="task-pomodoros">${task.pomodoros}🍅</span>` : ''}
            <button class="task-delete" onclick="deleteTask(${task.id})">删除</button>
        `;
        
        tasksList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 统计数据管理
function updateStats() {
    todayPomodoros.textContent = pomodorosCompleted;
    totalMinutes.textContent = minutesWorked;
    tasksCompleted.textContent = tasksFinished;
    breakCount.textContent = breaksCompleted;
}

function saveStats() {
    const stats = {
        pomodorosCompleted,
        minutesWorked,
        tasksFinished,
        breaksCompleted,
        date: new Date().toDateString()
    };
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    updateStats();
}

function loadStats() {
    const saved = localStorage.getItem('pomodoroStats');
    const today = new Date().toDateString();
    
    if (saved) {
        const stats = JSON.parse(saved);
        if (stats.date === today) {
            pomodorosCompleted = stats.pomodorosCompleted;
            minutesWorked = stats.minutesWorked;
            tasksFinished = stats.tasksFinished;
            breaksCompleted = stats.breaksCompleted;
        }
    }
    updateStats();
}

function clearStats() {
    if (confirm('确定要清除今日数据吗？')) {
        pomodorosCompleted = 0;
        minutesWorked = 0;
        tasksFinished = 0;
        breaksCompleted = 0;
        sessionNum = 1;
        saveStats();
    }
}

// 设置管理
function loadSettings() {
    soundCheckbox.checked = localStorage.getItem('soundEnabled') !== 'false';
    notificationCheckbox.checked = localStorage.getItem('notificationEnabled') !== 'false';
    titleNotificationCheckbox.checked = localStorage.getItem('titleNotificationEnabled') !== 'false';
    darkModeCheckbox.checked = localStorage.getItem('darkMode') !== 'false';
    
    webhookUrlInput.value = localStorage.getItem('webhookUrl') || '';
    webhookEnabledCheckbox.checked = localStorage.getItem('webhookEnabled') === 'true';
    
    // 集成设置
    notionApiKey.value = localStorage.getItem('notionApiKey') || '';
    notionDatabaseId.value = localStorage.getItem('notionDatabaseId') || '';
    notionEnabled.checked = localStorage.getItem('notionEnabled') === 'true';
    
    feishuWebhook.value = localStorage.getItem('feishuWebhook') || '';
    feishuEnabled.checked = localStorage.getItem('feishuEnabled') === 'true';
    
    autoSyncInterval.value = localStorage.getItem('autoSyncInterval') || '0';
    
    workDurationInput.value = localStorage.getItem('workDuration') || 25;
    breakDurationInput.value = localStorage.getItem('breakDuration') || 5;
    longBreakDurationInput.value = localStorage.getItem('longBreakDuration') || 15;
    longBreakEnabledCheckbox.checked = localStorage.getItem('longBreakEnabled') !== 'false';
    
    timeLeft = workDurationInput.value * 60;
    totalTimeInPhase = timeLeft;
}

// 任务存储管理
function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('pomodoroTasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
            if (tasks.length > 0) {
                taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
            }
        } catch (e) {
            tasks = [];
        }
    }
    renderTasks();
}

// 导出为 CSV
function exportAsCSV() {
    const headers = ['任务', '完成状态', '关联番茄数'];
    const rows = tasks.map(task => [
        `"${task.text.replace(/"/g, '""')}"`,
        task.completed ? '✓ 已完成' : '未完成',
        task.pomodoros
    ]);
    
    // 添加统计数据
    const stats = [
        ['', '', ''],
        ['统计数据', '数值', ''],
        ['完成番茄数', pomodorosCompleted, ''],
        ['专注分钟数', minutesWorked, ''],
        ['完成任务数', tasksFinished, ''],
        ['休息次数', breaksCompleted, ''],
        ['导出时间', new Date().toLocaleString('zh-CN'), '']
    ];
    
    const allRows = [headers, ...rows, ...stats];
    const csvContent = allRows.map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, 'pomodoro-data.csv', 'text/csv;charset=utf-8;');
}

// 导出为 Markdown
function exportAsMarkdown() {
    let markdown = '# 番茄钟统计报告\n\n';
    markdown += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    // 统计摘要
    markdown += '## 📊 今日统计摘要\n\n';
    markdown += `| 指标 | 数值 |\n`;
    markdown += `|------|------|\n`;
    markdown += `| 完成番茄数 | ${pomodorosCompleted} |\n`;
    markdown += `| 专注分钟数 | ${minutesWorked} |\n`;
    markdown += `| 完成任务数 | ${tasksFinished} |\n`;
    markdown += `| 休息次数 | ${breaksCompleted} |\n\n`;
    
    // 任务列表
    markdown += '## 📋 任务列表\n\n';
    if (tasks.length === 0) {
        markdown += '暂无任务\n\n';
    } else {
        tasks.forEach((task, index) => {
            const status = task.completed ? '✅' : '⭕';
            const pomodoroEmoji = task.pomodoros > 0 ? ` 🍅 × ${task.pomodoros}` : '';
            markdown += `${index + 1}. ${status} ${task.text}${pomodoroEmoji}\n`;
        });
        markdown += '\n';
    }
    
    // 统计详情
    markdown += '## 📈 详细统计\n\n';
    markdown += `- **总专注时长**: ${minutesWorked} 分钟 ≈ ${(minutesWorked / 60).toFixed(1)} 小时\n`;
    markdown += `- **平均每个番茄**: ${pomodorosCompleted > 0 ? (minutesWorked / pomodorosCompleted).toFixed(1) : 0} 分钟\n`;
    markdown += `- **休息总时长**: ${breaksCompleted * 5} 分钟（短休息）+ 长休息\n`;
    markdown += `- **任务完成率**: ${tasks.length > 0 ? ((tasksFinished / tasks.length) * 100).toFixed(1) : 0}%\n\n`;
    
    // 设置信息
    markdown += '## ⚙️ 设置配置\n\n';
    markdown += `- 工作时长: ${workDurationInput.value} 分钟\n`;
    markdown += `- 短休息: ${breakDurationInput.value} 分钟\n`;
    markdown += `- 长休息: ${longBreakDurationInput.value} 分钟\n`;
    markdown += `- 启用长休息: ${longBreakEnabledCheckbox.checked ? '是' : '否'}\n`;
    
    downloadFile(markdown, 'pomodoro-report.md', 'text/markdown;charset=utf-8;');
}

// 下载文件辅助函数
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 导出为 ICS（日历格式）
function exportAsICS() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0].replace(/-/g, '');
    
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:-//番茄钟 Pomodoro Timer//CN\n';
    ics += 'CALSCALE:GREGORIAN\n';
    ics += `X-WR-CALNAME:番茄钟 - ${today.toLocaleDateString('zh-CN')}\n`;
    ics += 'X-WR-TIMEZONE:Asia/Shanghai\n';
    ics += 'X-WR-CALDESC:番茄工作法任务和统计\n';
    ics += `METHOD:PUBLISH\n`;
    
    // 添加任务事件
    tasks.forEach((task, index) => {
        const eventDate = todayString;
        const eventTime = String(9 + Math.floor(index * 0.5)).padStart(2, '0') + '0000';
        const eventEndTime = String(9 + Math.floor(index * 0.5) + 1).padStart(2, '0') + '0000';
        
        ics += 'BEGIN:VEVENT\n';
        ics += `UID:task-${task.id}@pomodoro-timer.local\n`;
        ics += `DTSTAMP:${today.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        ics += `DTSTART:${eventDate}T${eventTime}\n`;
        ics += `DTEND:${eventDate}T${eventEndTime}\n`;
        ics += `SUMMARY:${task.text}\n`;
        ics += `DESCRIPTION:关联番茄数: ${task.pomodoros}\\n状态: ${task.completed ? '已完成' : '未完成'}\n`;
        ics += `LOCATION:番茄钟应用\n`;
        ics += `CATEGORIES:任务,${task.completed ? '已完成' : '未完成'}\n`;
        ics += `PRIORITY:${task.completed ? '0' : '5'}\n`;
        ics += `STATUS:${task.completed ? 'COMPLETED' : 'NEEDS-ACTION'}\n`;
        ics += `X-APPLE-STRUCTURED-LOCATION:iPhone Simulator\n`;
        ics += `END:VEVENT\n`;
    });
    
    // 添加工作统计事件
    ics += 'BEGIN:VEVENT\n';
    ics += `UID:stats-${todayString}@pomodoro-timer.local\n`;
    ics += `DTSTAMP:${today.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
    ics += `DTSTART:${todayString}T${String(18).padStart(2, '0')}0000\n`;
    ics += `DTEND:${todayString}T${String(19).padStart(2, '0')}0000\n`;
    ics += `SUMMARY:📊 今日番茄统计\n`;
    ics += `DESCRIPTION:完成番茄: ${pomodorosCompleted}\\n专注分钟: ${minutesWorked}\\n完成任务: ${tasksFinished}\\n休息次数: ${breaksCompleted}\n`;
    ics += `LOCATION:番茄钟应用\n`;
    ics += `CATEGORIES:统计,番茄钟\n`;
    ics += `PRIORITY:3\n`;
    ics += `END:VEVENT\n`;
    
    ics += 'END:VCALENDAR';
    
    downloadFile(ics, `pomodoro-${todayString}.ics`, 'text/calendar;charset=utf-8;');
}

// 显示 ICS 订阅信息
function showIcsSubscribeInfo() {
    const currentUrl = window.location.href.replace('pomodoro.html', '');
    const subscribeUrl = currentUrl + 'pomodoro-subscribe.ics';
    
    const message = `
📅 日历订阅功能说明：

此功能生成一个 ICS 日历文件，可导入到：
✅ Google Calendar
✅ Microsoft Outlook
✅ Apple Calendar (iCal)
✅ Any CalDAV-compatible application

如要实现自动订阅，您需要：

1️⃣ 部署到服务器：
   将文件放在网络服务器上

2️⃣ 创建动态订阅端点：
   生成实时的 pomodoro-subscribe.ics 文件
   
3️⃣ 在日历应用中添加订阅：
   使用 ICS 文件的 URL 添加日历源

示例 URL:
${subscribeUrl}

💡 提示：当前您可以先导出 ICS 文件，然后手动导入日历应用。
    若要自动同步，需要部署到服务器上。

您的当前位置:
${currentUrl}
    `.trim();
    
    alert(message);
}

// PWA 安装函数
async function installPWA() {
    if (!window.deferredPrompt) {
        alert('此浏览器不支持 PWA 安装，或已经安装过了。');
        return;
    }
    
    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    console.log(`用户响应: ${outcome}`);
    window.deferredPrompt = null;
}

// ==================== Notion 集成 ====================

function connectNotion() {
    const apiKey = notionApiKey.value.trim();
    const dbId = notionDatabaseId.value.trim();
    
    if (!apiKey || !dbId) {
        alert('请输入 Notion API Key 和 Database ID');
        return;
    }
    
    localStorage.setItem('notionApiKey', apiKey);
    localStorage.setItem('notionDatabaseId', dbId);
    updateNotionStatus('✅ 已保存凭证', 'success');
}

function syncToNotion() {
    const apiKey = notionApiKey.value.trim();
    const dbId = notionDatabaseId.value.trim();
    
    if (!apiKey || !dbId) {
        alert('请先连接 Notion');
        return;
    }
    
    updateNotionStatus('📤 正在同步到 Notion...', 'pending');
    
    tasks.forEach(task => {
        const payload = {
            parent: { database_id: dbId },
            properties: {
                '任务名称': { title: [{ text: { content: task.text } }] },
                '状态': { status: { name: task.completed ? '完成' : '未完成' } },
                '关联番茄': { number: task.pomodoros }
            }
        };
        
        fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(err => console.log('Notion 错误:', err));
    });
    
    updateNotionStatus('✅ 已同步到 Notion！', 'success');
}

function showNotionTemplate() {
    const msg = `📋 Notion 模板配置\n\n✅ 打开 https://www.notion.so/my-integrations\n✅ 创建 Integration 并复制 API Key\n✅ 创建 Table 数据库\n✅ 添加属性: 任务名称、状态、关联番茄\n✅ 粘贴 API Key 和 Database ID 到番茄钟\n✅ 点击连接 Notion`;
    alert(msg);
}

function updateNotionStatus(message, status) {
    notionStatus.textContent = message;
    notionStatus.className = 'integration-status ' + status;
}

// ==================== 飞书集成 ====================

function syncToFeishu() {
    const webhook = feishuWebhook.value.trim();
    
    if (!webhook) {
        alert('请输入飞书 Webhook URL');
        return;
    }
    
    const card = {
        "msg_type": "interactive",
        "card": {
            "config": { "wide_screen_mode": true },
            "elements": [{
                "tag": "markdown",
                "content": `🍅 番茄钟日报\n📊 完成: ${pomodorosCompleted} | 时长: ${minutesWorked}min | 任务: ${tasksFinished}`
            }]
        }
    };
    
    fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
    })
    .then(res => res.json())
    .then(data => {
        updateFeishuStatus(data.code === 0 ? '✅ 已发送到飞书！' : '❌ 发送失败', 'success');
        localStorage.setItem('feishuWebhook', webhook);
    })
    .catch(err => updateFeishuStatus('❌ 发送失败', 'error'));
}

function showFeishuTemplate() {
    const msg = `📋 飞书集成配置\n\n✅ 打开飞书群组设置\n✅ 开发者工具 → 添加机器人\n✅ 复制 Webhook URL\n✅ 粘贴到番茄钟"飞书 Webhook URL"\n✅ 点击"发送到飞书"`;
    alert(msg);
}

function updateFeishuStatus(message, status) {
    feishuStatus.textContent = message;
    feishuStatus.className = 'integration-status ' + status;
}

// ==================== 集简云 ====================

function showJibeCloudTemplate() {
    alert(`⚡ 集简云工作流\n\n1. 注册 integromat.com\n2. 创建新场景\n3. 添加自定义 Webhook\n4. 关联 Google Sheets/飞书/Slack\n5. 设置时间触发\n6. 启用并测试`);
}

function exportWebhookConfig() {
    const config = {
        "webhook_endpoint": window.location.href.replace('pomodoro.html', 'webhook'),
        "events": ["work_completed", "break_completed", "daily_summary"],
        "integrations": ["notion", "feishu", "integromat"]
    };
    downloadFile(JSON.stringify(config, null, 2), 'webhook-config.json', 'application/json;charset=utf-8;');
}

// ==================== 自动同步 ====================

function setupAutoSync() {
    const interval = parseInt(autoSyncInterval.value) || 0;
    localStorage.setItem('autoSyncInterval', interval);
    
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    
    if (interval > 0) {
        autoSyncTimer = setInterval(() => {
            if (notionEnabled.checked) syncToNotion();
            if (feishuEnabled.checked) syncToFeishu();
        }, interval * 1000);
        syncStatus.textContent = `✅ 自动同步每 ${interval} 秒`;
        syncStatus.className = 'integration-status success';
    } else {
        syncStatus.textContent = '⏸️ 自动同步已禁用';
        syncStatus.className = 'integration-status pending';
    }
}

// 初始化应用
init();
