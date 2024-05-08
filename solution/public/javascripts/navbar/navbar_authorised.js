let socket = io()
const $notificationCounter = $("#notification-count")

window.addEventListener("load", async (e) => {

    try {
        const notificationCount = await axios.get("/api/new-notification-count")
        const countInt = parseInt(notificationCount.data.count)
        $notificationCounter.text(countInt >= 0 ?  countInt : 0)
        socket.emit("user_active", {user_id: notificationCount.data.user_id})

        socket.on("new_notification", () => {
            $notificationCounter.text(parseInt($notificationCounter.text()) + 1)
        })
    }catch(e) {
        console.log(e)
    }


})