function registerNotificationSockets(io, socket) {
   socket.on("user_active", data => {
       console.log('User active: ' + data.user_id)
       socket.join(data.user_id);
   })
    socket.on("new_notification", data => {
        const room = data.target_user._id
        console.log("New notification for user: " + room)
        socket.broadcast.to(room).emit("new_notification", data)
    })
    socket.on("delete_notification", data => {
        const room = data.target_user._id
        console.log("Delete notification user: " + room)
        socket.broadcast.to(room).emit("delete_notification", {notificationID : data._id})
    })
}

module.exports = {
    registerNotificationSockets
}