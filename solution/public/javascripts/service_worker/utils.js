/**
 * Util function to send notification with the Notification Object
 * @param body Content of the notification
 */
const sendNotification = (body) => {
    new Notification("Plants App", {body, icon: "/images/logo.png"})
}
