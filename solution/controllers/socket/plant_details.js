function registerPlantDetailsSockets(io, socket) {
    socket.on('viewing_plant', (data) => {
        console.log('User viewing plant: ' + data.plant_id)
        socket.join(data.plant_id);
    });

    socket.on('leaving_plant', (data) => {
        console.log('User leaving plant: ' + data.plant_id)
        socket.leave(data.plant_id);
    });

    socket.on('new_suggestion', (room, data) => {
        socket.broadcast.to(room).emit('new_suggestion', data);
    });

    socket.on('suggestion_rating', (room, data) => {
        socket.broadcast.to(room).emit('suggestion_rating', data);
    });

    socket.on('new_comment', (room, data) => {
        data.post_id = room
        socket.broadcast.to(room).emit('new_comment', data);
    });

    socket.on('new_reply', (room, data) => {
        socket.broadcast.to(room).emit('new_reply', data);
    });

    socket.on('like_count', (room, data) => {
        socket.broadcast.to(room).emit('like_count', data);
    });
}

module.exports = {
    registerPlantDetailsSockets
}