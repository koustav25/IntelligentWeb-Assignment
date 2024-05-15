const plant_details = require('./plant_details');
const notifications = require("./notification")
const feed = require("./feed")

let io;
exports.init = (server) => {
    io = server

    server.on('connection', (socket) => {
        try {
            plant_details.registerPlantDetailsSockets(server, socket);
            notifications.registerNotificationSockets(server, socket);
            feed.registerFeedSockets(server,socket)
        } catch (error) {
            console.error(error);
        }
    });
}

exports.broadcastNewPost = post => {
    console.log(io)
    console.log(post)
    io.to("feed").emit("new_post", {post})
}