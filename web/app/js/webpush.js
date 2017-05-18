'use strict';

let _ = function (id) {
    return document.getElementById(id);
};
let appServerURL = "http://localhost:8080/push";
let appServerPublicKeyURL = "http://localhost:8080/push/public-key";
let subscription = null;

function enablePushRequest(sub) {
    subscription = sub;
    _('subscribe').classList.add('subscribing');
    _('push').disabled = false;
    _('message').disabled = false;
    _('url').disabled = false;
    _('icon').disabled = false;
}

function disablePushRequest() {
    _('subscribe').classList.remove('subscribing');
    _('push').disabled = true;
    _('message').disabled = true;
    _('url').disabled = true;
    _('icon').disabled = true;
}

function checkPushPermission(evt) {
    let state = evt.state || evt.status;
    if (state !== 'denied')
        navigator.serviceWorker.ready.then(requestPushSubscription);
}

function requestNotificationPermission() {
    Notification.requestPermission(function (permission) {
        if (permission !== 'denied') {

            if ('permissions' in navigator)
                navigator.permissions.query({
                    name: 'push',
                    userVisibleOnly: true
                }).then(checkPushPermission);
            else if (Notification.permission !== 'denied') {
                navigator.serviceWorker.ready.then(requestPushSubscription);
            }
        }
    });
}

function togglePushSubscription() {
    if (!_('subscribe').classList.contains('subscribing')) {
        requestNotificationPermission();
    }
    else {
        if (subscription) {
            subscription.unsubscribe();
            subscription = null;

            disablePushRequest()
        }
    }
}

function getSubscription(sub) {
    delete _('status').dataset.error;
    _('status').classList.remove('subscribe-error');
    if(sub) {
        enablePushRequest(sub);
    }
    else {
        disablePushRequest();
    }
}

function errorSubscription(err) {
    _('status').dataset.error = err;
    _('status').classList.add('subscribe-error');
}

function decodeBase64URL(str) {
    let dec = atob(str.replace(/\-/g, '+').replace(/_/g, '/'));
    let buffer = new Uint8Array(dec.length);
    for(let i = 0 ; i < dec.length ; i++)
        buffer[i] = dec.charCodeAt(i);
    return buffer;
}

function requestPushSubscription(registration) {
    return fetch(appServerPublicKeyURL).then(function(response) {
        return response.text();
    }).then(function(key) {
        let opt = {
            userVisibleOnly: true,
            applicationServerKey: decodeBase64URL(key)
        };

        return registration.pushManager.subscribe(opt).then(getSubscription, errorSubscription);
    });
}

function requestPushNotification() {
    if (subscription) {
        fetch(appServerURL, {
            credentials: 'include',
            method: 'POST',
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                key: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
                    .replace(/\+/g, '-').replace(/\//g, '_'),
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
                    .replace(/\+/g, '-').replace(/\//g, '_'),
                message: _('message').value || '(empty)',
                tag: 'tag',
                icon: _('icon').value || '/image/ic_alarm_black_48dp_2x.png',
                url: _('url').value
            })
        });
    }
}

function serviceWorkerReady(registration) {
    if('pushManager' in registration) {
        var s = _('subscribe');
        s.disabled = false;
        s.classList.remove('subscribing');
        registration.pushManager.getSubscription().then(getSubscription);
    }
}

function init() {
    if ('serviceWorker' in navigator) {
        _('subscribe').addEventListener('click', togglePushSubscription, false);
        _('push').addEventListener('click', requestPushNotification, false);
        navigator.serviceWorker.ready.then(serviceWorkerReady);
        navigator.serviceWorker.register('serviceworker.js');
    } else {
        console.log("disabled serviceWorker")
    }
}

window.addEventListener('load', init, false);