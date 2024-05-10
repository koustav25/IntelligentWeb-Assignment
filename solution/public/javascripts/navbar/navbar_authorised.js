let socket;
const $notificationCounter = $("#notification-count")

window.addEventListener("load", async (e) => {

    try {
        const notificationCount = await axios.get("/api/new-notification-count")
        const countInt = parseInt(notificationCount.data.count)
        $notificationCounter.text(countInt >= 0 ? countInt : 0)

        if (countInt > 0) {
            $notificationCounter.removeClass("d-none")
        }

        socket.emit("user_active", {user_id: notificationCount.data.user_id})

        socket.on("new_notification", () => {
            //If the notifications count was 0, then we need to show the counter
            if (parseInt($notificationCounter.text()) === 0) {
                $notificationCounter.removeClass("d-none")
            }

            $notificationCounter.text(parseInt($notificationCounter.text()) + 1)
        })
    } catch (e) {
        console.log(e)
    }
})

document.addEventListener("DOMContentLoaded", async (e) => {
    socket = io()
});