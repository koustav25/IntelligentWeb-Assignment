function registerFeedSockets(io, socket) {
    socket.on("viewing_feed", () => {
        console.log("User viewing feed")
        socket.join("feed")
    })
    socket.on("leaving_feed", () => {
        console.log("User leaving feed")
        socket.leave("feed")
    })
}

module.exports = {
    registerFeedSockets
}