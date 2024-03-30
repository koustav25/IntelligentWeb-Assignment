let map;
let postMarker;

let socket = io();

document.addEventListener('DOMContentLoaded', function () {
    //TODO: Initialise Socket.io
    registerSocketListeners();

    map = L.map('map').setView([postCoords.latitude, postCoords.longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    postMarker = L.marker([postCoords.latitude, postCoords.longitude]).addTo(map);
});

function registerSocketListeners() {
    socket.on('new_suggestion', (data) => {

    });

    socket.on('upvote_count', (data) => {

    });

    socket.on('downvote_count', (data) => {

    });

    socket.on('new_comment', (data) => {

    });

    socket.on('new_reply', (data) => {

    });

    socket.on('like_count', (data) => {

    });

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('viewing_plant', {plant_id: plantID});
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        socket.emit('leaving_plant', {plant_id: plantID});
    });

    window.addEventListener('beforeunload', function (event) {
        socket.emit('leaving_plant', {plant_id: plantID});
    });
}

