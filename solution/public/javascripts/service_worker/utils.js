/**
 * Util function to send notification with a service worker
 * @param body Content of the notification
 * @returns {Promise<void>}
 */
const sendNotification = async (body) => {
    const swr = await navigator.serviceWorker.ready
    await swr.showNotification("Plants App", {body})
}
