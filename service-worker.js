const CACHE_NAME = 'pomodoro-v1';
const FILES_TO_CACHE = [
    '/pomodoro.html',
    '/pomodoro.css',
    '/pomodoro.js',
    '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 只缓存 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 对于本地资源，优先使用缓存
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then((response) => {
                            // 缓存成功的响应
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                            return response;
                        })
                        .catch(() => {
                            // 离线时返回缓存
                            return caches.match('/pomodoro.html');
                        });
                })
        );
        return;
    }

    // 对于外部请求（如 Webhook），直接网络优先
    event.respondWith(
        fetch(request)
            .catch(() => {
                return caches.match('/pomodoro.html');
            })
    );
});

// 处理后台同步（用于离线时的操作）
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pomodoro-data') {
        event.waitUntil(syncData());
    }
});

// 处理推送通知
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || '番茄钟提醒',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><circle cx="96" cy="96" r="96" fill="%23ff6b6b"/><text x="96" y="120" font-size="120" text-anchor="middle" fill="white" font-family="Arial">🍅</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%23ff6b6b"/><text x="48" y="62" font-size="60" text-anchor="middle" fill="white">🍅</text></svg>',
        tag: 'pomodoro-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('番茄钟', options)
    );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // 如果已有打开的窗口，就聚焦
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 否则打开新窗口
                if (clients.openWindow) {
                    return clients.openWindow('/pomodoro.html');
                }
            })
    );
});

// 同步数据辅助函数
function syncData() {
    return Promise.resolve();
}
