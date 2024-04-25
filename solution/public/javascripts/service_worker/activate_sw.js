$(document).ready(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    if ("Notification" in window) {
        if (Notification.permission !== "denied") {
            Notification.requestPermission().then(p => {
                if (p === " granted") {
                    navigator.serviceWorker.ready.then(swr => {
                        swr.showNotification("Plants App", {body: "Notifications are enabled!"}).then(r => console.log(r))
                    })
                }
            })
        }
    }
})