const plant_details = require('./plant_details');

exports.init = (server) => {
    server.on('connection', (socket) => {
        try {
            plant_details.registerPlantDetailsSockets(server, socket);
            //TODO: Add more socket listeners here
        } catch (error) {
            console.error(error);
        }
    });
}