const $offlineBox = $("#offline-mode")
const $notificationCounter = $("#notification-count")
var isOnline = navigator.onLine;
let socket = io()

isOnline ? $offlineBox.hide() : $offlineBox.show()
window.addEventListener('offline', (e) => {
    $offlineBox.show();
    isOnline = false
});

window.addEventListener('online', (e) => {
    $offlineBox.hide();
    isOnline = true
});
window.addEventListener("load", async (e) => {

    try {
        const notificationCount = await axios.get("/api/new-notification-count")
        const countInt = parseInt(notificationCount.data.count)
        $notificationCounter.text(countInt >= 0 ?  countInt : 0)
        socket.emit("user_active", {user_id: notificationCount.data.user_id})
    }catch(e) {
        console.log(e)
    }

    socket.on("new_notification", () => {
        $notificationCounter.text(parseInt($notificationCounter.text()) + 1)
    })
})