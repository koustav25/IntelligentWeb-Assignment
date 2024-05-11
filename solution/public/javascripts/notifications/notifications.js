const $markAllBtn = $("#mark-all")
const $notificationsWrapper = $("#notifications-wrapper")

const $loadingSpinner = $("#loading-spinner")
const $updateSpinner = $("#update-spinner")
const $notificationsEnd = $("#notifications-end")
const $errorBox = $("#error-box")
const updateNotificationsGap = 3000

$errorBox.hide()
$notificationsEnd.hide()
$updateSpinner.hide()
$notificationsEnd.hide()

let page = 0
socket = io()
let updateNotificationTime = Date.now()

const getNotificationHTML = (notification) => {
    const envelopeTag = notification.seen ? `<i class="fa-regular fa-envelope fa-xl"></i>` : `<i data-envelope-${notification._id} class="fa-regular fa-envelope-open fa-xl"></i>`
    return ` 
         <div class="me-auto ms-auto border border-2 shadow-sm mb-3 rounded-2 p-3 ${!notification.seen && "border-danger-subtle"}"id="${notification._id}" data-seen-${notification.seen}>
                <div class="container-fluid mb-2">
                    <div class="row gy-3">
                        <div class="d-flex col-sm ">
                            <div class="me-1 pt-1 pb-1 pe-1 ps-1 fs-7">
                                ${envelopeTag}
                            </div>
                            <h3 class="ms-1 m-0 fs-5 align-self-center">
                                <a class="notification-link" href="/plant/${notification.target_post._id}">${notification.content.title}</a>
                            </h3>
                        </div>
        
                        <div class="d-flex col-sm justify-content-center justify-content-sm-end">
                            ${!notification.seen ? `<div class="pt-1 pb-1 pe-3 ps-3 rounded-4 fs-7 bg-danger bg-opacity-25 me-2 border border-danger"data-new-${notification._id}>New</div>` : ``}
                            <div class="pt-1 pb-1 pe-3 ps-3 rounded-4 fs-7 ${notification.target_user._id === notification.target_post.posting_user._id ? "bg-success bg-opacity-75 text-white" : " bg-warning text-black"}">
                                ${notification.target_user._id === notification.target_post.posting_user._id ? "Your Post" : "Commented Post"}
                            </div>
                        </div>
                    </div>
        
        
                </div>
            <div class="ms-3 mt-3">
                <p class="m-0 fs-7 text-muted">Date: ${new Date(notification.createdAt).toLocaleDateString('en-GB',
        {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })}
                </p>
                <p class="m-0 fs-6 mt-2">
                    ${notification.content.body}
                </p>
            </div>
        </div>`
}

const markAsRead = async (wrapper, envelope, id) => {
    wrapper.removeClass("border-danger-subtle");
    envelope.removeClass("fa-envelope-open")
    envelope.addClass("fa-envelope")
    $(`[data-new-${id}`).remove()
    const newCounter = parseInt($notificationCounter.text()) - 1
    $notificationCounter.text(newCounter > 0 ? newCounter : 0);
    await axios.post("/api/view-notification", {notificationID: id})
}

const appendNotification = (n, append = true) => {
    const $nTag = $(getNotificationHTML(n))
    if(append){
        $notificationsWrapper.append($nTag)
    } else {
        $notificationsWrapper.prepend($nTag)

    }
    const $envelope = $(`[data-envelope-${n._id}]`)
    $envelope.on('click', async () => {
        await markAsRead($nTag, $envelope, n._id)
    })
}

const updateNotifications = (notifications) => {
    for (let i = 0; i < notifications.length; i++) {
        // const $n = $(getNotificationHTML(notifications[i]))
        // $notificationsWrapper.append($n)
        // const $envelope = $(`[data-envelope-${notifications[i]._id}]`)
        // $envelope.on('click', async () => {
        //     await markAsRead($n, $envelope, notifications[i]._id)
        // })
        appendNotification(notifications[i])
    }
}

window.addEventListener("load", async e => {
    try {
        const firstPageNotifications = await axios.get("/api/get-notifications", {params: {page}})
        updateNotifications(firstPageNotifications.data.notifications)
        page += 1
        $loadingSpinner.hide()
    } catch (e) {
        console.log(e)
    }


    $markAllBtn.on("click", async () => {
        $("[data-seen-false]").each(async function () {
            const $envelope = $(`[data-envelope-${this.id}]`)
            $(this).removeClass("border-danger-subtle");
            $envelope.removeClass("fa-envelope-open")
            $envelope.addClass("fa-envelope")
            $(`[data-new-${this.id}]`).remove()
        });
        await axios.post("/api/mark-all-notifications-as-read")
        $notificationCounter.text(0)

    })

    socket.on("new_notification", data => {
        appendNotification(data, false)
    })

    socket.on("delete_notification", data => {
        $(`#${data.notificationID}`).remove()
        $notificationCounter.text(parseInt($notificationCounter.text()) - 1)
    })
})

$(window).scroll(async function () {

    const timeDiff = Date.now() - updateNotificationTime
    if (timeDiff > updateNotificationsGap && $(window).scrollTop() + $(window).height() >= $(document).height()) {
        updateNotificationTime = Date.now()

        $notificationsEnd.hide()
        $loadingSpinner.show()
        try {
            const newNotifications = await axios.get("/api/get-notifications", {params: {page}})
            updateNotifications(newNotifications.data.notifications)

            if (newNotifications.data.notifications.length > 0) {
                page += 1
            } else {
                $notificationsEnd.show()
            }
            $loadingSpinner.hide()
        } catch (e) {
            $errorBox.show();
            console.log(e)
        }


    }

    if (timeDiff > updateNotificationsGap && $(window).scrollTop() <= 0) {
        updateNotificationTime = Date.now()

        page = 0
        $notificationsWrapper.empty()
        $notificationsEnd.hide()
        $updateSpinner.show()
        try {
            const updateNotificationPage = await axios.get("/api/get-notifications", {params: {page}})
            updateNotifications(updateNotificationPage.data.notifications)
            $updateSpinner.hide()
            page += 1
        } catch (e) {
            console.log(e)
            $errorBox.show();
        }

    }

});
