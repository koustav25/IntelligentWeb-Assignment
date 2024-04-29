const $offlineBox = $("#offline-mode")
var isOnline = navigator.onLine;

isOnline ? $offlineBox.hide() : $offlineBox.show()
window.addEventListener('offline', (e) => {
    $offlineBox.show();
    isOnline = false
});

window.addEventListener('online', (e) => {
    $offlineBox.hide();
    isOnline = true
});