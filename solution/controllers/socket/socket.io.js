const plant_details = require('./plant_details');
const feed = require("./feed")

exports.init = (server) => {
    server.on('connection', (socket) => {
        try {
            plant_details.registerPlantDetailsSockets(server, socket);
            feed.registerFeedSockets(server,socket)
            //TODO: Add more socket listeners here
        } catch (error) {
            console.error(error);
        }
    });
}