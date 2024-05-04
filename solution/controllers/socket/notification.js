function registerNotificationSockets(io, socket) {
   socket.on("user_active", data => {
       console.log('User active: ' + data.user_id)
       socket.join(data.user_id);
   })
    socket.on("disconnect", () => {
        console.log('User disconnected: ')
        // socket.leave(data.user_id)
    })
    socket.on("notify", data => {
        const room = data.target_user._id
        console.log("New notification for user: " + room)
        socket.broadcast.to(room).emit("new_notification", data)
    })
}

module.exports = {
    registerNotificationSockets
}