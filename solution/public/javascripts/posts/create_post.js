let marker;
document.addEventListener('DOMContentLoaded', function() {
    // Setting date input value to today's date
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    document.getElementById('seenAt').value = today;

    const mymap = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(mymap);

    marker = L.marker([51.5, -0.09]).addTo(mymap);

    mymap.on('click', onMapClick);

    document.getElementById('useCurrentLocation').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                var latlng = L.latLng(lat, lng);
                marker.setLatLng(latlng);
                mymap.setView(latlng, 13);
                document.getElementById('location').value = latlng.toString();
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
});


function onMapClick(e) {
    marker.setLatLng(e.latlng);
    document.getElementById('location').value = e.latlng.toString();
}
