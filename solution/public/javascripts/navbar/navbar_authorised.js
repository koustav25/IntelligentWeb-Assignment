let socket;
let $notificationCounter;

const setNotificationCounter = async ($counter) => {
    const notificationCount = await axios.get("/api/new-notification-count")
    const countInt = parseInt(notificationCount.data.count)
    $notificationCounter.text(countInt >= 0 ? countInt : 0)

    if (countInt > 0) {
        $notificationCounter.removeClass("d-none")
    } else {
        $notificationCounter.addClass("d-none")
    }

    return notificationCount
}
window.addEventListener("load", async (e) => {
    $notificationCounter = $("#notification-count")

    try {
        const notificationCount = await setNotificationCounter($notificationCounter);
        socket.emit("user_active", {user_id: notificationCount.data.user_id})

        socket.on("new_notification", () => {
            //If the notifications count was 0, then we need to show the counter
            if (parseInt($notificationCounter.text()) == 0) {
                $notificationCounter.removeClass("d-none")
            }

            $notificationCounter.text(parseInt($notificationCounter.text()) + 1)
        })

        socket.on("read_notification", () => {
            const newCounter = parseInt($notificationCounter.text()) - 1
            $notificationCounter.text(newCounter > 0 ? newCounter : 0);
        })
    } catch (e) {
        console.log(e)
    }
})

document.addEventListener("DOMContentLoaded", async (e) => {
    socket = io()

    window.addEventListener('online', async (e) => {
        await setNotificationCounter($notificationCounter);
    });

    if("Notification" in window){
        if(Notification.permission !== "granted"){
            Notification.requestPermission().then(permission => {
                if(permission === "granted"){
                    navigator.serviceWorker.ready.then(swr => {
                        swr.showNotification("Plants App", {body:" Notifications are enabled"})
                            .then(r => {
                                console.log(r)
                            })
                    })
                }
            })
        }
    }
});