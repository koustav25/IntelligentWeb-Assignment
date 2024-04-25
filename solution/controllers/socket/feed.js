function registerFeedSockets(io, socket) {
    socket.on('viewing_plant', (data) => {
        console.log('User viewing plant: ' + data.plant_id)
        socket.join(data.plant_id);
    });


    socket.on('new_comment', (room, data) => {
        data.post_id = room
        socket.broadcast.to(room).emit('new_comment', data);
    });
}

module.exports = {
    registerFeedSockets
}