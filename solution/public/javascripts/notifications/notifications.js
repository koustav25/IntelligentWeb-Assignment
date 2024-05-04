const $notifications = $("[data-seen-false]")
const $markAllBtn = $("#mark-all")
const $notificationsWrapper = $("#notifications-wrapper")

const getNotificationHTML = (notification) => {
    const envelopeTag = notification.seen ? `<i class="fa-regular fa-envelope fa-xl"></i>` : `<i data-envelope-${ notification._id } class="fa-regular fa-envelope-open fa-xl"></i>`
    return ` 
         <div class="me-auto ms-auto border border-2 shadow-sm mb-3 rounded-2 p-3 ${ !notification.seen && "border-danger-subtle" }"id="${ notification._id }" data-seen-${ notification.seen }>
                <div class="container-fluid mb-2">
                    <div class="row gy-3">
                        <div class="d-flex col-sm ">
                            <div class="me-1 pt-1 pb-1 pe-1 ps-1 fs-7">
                                ${envelopeTag}
                            </div>
                            <h3 class="ms-1 m-0 fs-5 align-self-center">
                                ${ notification.content.title }
                            </h3>
                        </div>
        
                        <div class="d-flex col-sm justify-content-center justify-content-sm-end">
                            ${ !notification.seen ? `<div class="pt-1 pb-1 pe-3 ps-3 rounded-4 fs-7 bg-danger bg-opacity-25 me-2 border border-danger"data-new-${ notification._id }>New</div>` : ``}
                            <div class="pt-1 pb-1 pe-3 ps-3 rounded-4 fs-7 ${ notification.target_user._id === notification.target_post.posting_user._id ? "bg-success bg-opacity-75 text-white" : " bg-warning text-black" }">
                                ${ notification.target_user._id === notification.target_post.posting_user._id ? "Your Post" : "Commented Post" }
                            </div>
                        </div>
                    </div>
        
        
                </div>
            <div class="ms-3 mt-3">
                <p class="m-0 fs-7 text-muted">Date: ${ new Date(notification.createdAt).toLocaleDateString('en-GB',
                    {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    }) }
                </p>
                <p class="m-0 fs-6 mt-2">
                    ${ notification.content.body }
                </p>
            </div>
        </div>`
}

const markAsRead = async (wrapper, envelope, id) => {
    wrapper.removeClass("border-danger-subtle");
    envelope.removeClass("fa-envelope-open")
    envelope.addClass("fa-envelope")
    $(`[data-new-${id}`).remove()
    await axios.post("/api/view-notification", {notificationID: id})
}
window.addEventListener("load", e => {
    $notifications.each(function () {
        const $envelope = $(`[data-envelope-${this.id}]`)
        $envelope.on('click', async () => {
            await markAsRead($(this), $envelope, this.id)
        })
    });

    $markAllBtn.on("click", () => {
        $notifications.each(async function () {
            const $envelope = $(`[data-envelope-${this.id}]`)
            await markAsRead($(this), $envelope, this.id)
        });
    })

    socket.on("new_notification", data => {
        console.log(data)
        $notificationsWrapper.prepend(getNotificationHTML(data))
    })
})