function showNotification(data) {
    return self.registration.showNotification('VAPID WebPush Test', {
        icon: data.icon,
        body: data.body || '(with empty payload)',
        tag: data.tag || '(with empty payload)',
        data: data.url,
        vibrate: [400,100,400]
    });
}

function receivePush(event) {
    var data = '';
    if(event.data) {
        data = event.data.json();
    }

    if('showNotification' in self.registration) {
        event.waitUntil(showNotification(data));
    }
}

function notificationClick(event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
}

self.addEventListener('push', receivePush, false);
self.addEventListener('notificationclick', notificationClick, false);
