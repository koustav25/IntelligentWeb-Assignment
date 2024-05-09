const plant_details = require('./plant_details');
const notifications = require("./notification")
exports.init = (server) => {
    server.on('connection', (socket) => {
        try {
            plant_details.registerPlantDetailsSockets(server, socket);
            notifications.registerNotificationSockets(server, socket);
        } catch (error) {
            console.error(error);
        }
    });
}