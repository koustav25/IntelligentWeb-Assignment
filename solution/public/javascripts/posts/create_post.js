let marker;
document.addEventListener('DOMContentLoaded', function() {
    // Setting date input value to today's date
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    document.getElementById('seen_at').value = today;

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
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    $('#postForm').submit(handleFormSubmit);
});


function onMapClick(e) {
    marker.setLatLng(e.latlng);
    document.getElementById('latitude').value = e.latlng.lat;
    document.getElementById('longitude').value = e.latlng.lng;
}

async function handleFormSubmit(event) {
    try {
        let $postButton = $('#postButton');
        let $postSpinner = $('#postSpinner');

        $(this).removeClass('was-validated');

        event.preventDefault();
        event.stopPropagation();

        $postButton.addClass('disabled');
        $postSpinner.removeClass('d-none');

        if (!this.checkValidity()) {
            $(this).addClass('was-validated');
            $postButton.removeClass('disabled');
            $postSpinner.addClass('d-none');
            return;
        }

        const title = document.getElementById('title').value;
        const seen_at = document.getElementById('seen_at').value;
        const description = document.getElementById('description').value;
        const location_name = document.getElementById('location_name').value;
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        const height = document.getElementById('height').value;
        const spread = document.getElementById('spread').value;
        const sun_exposure = $('input[name="sun_exposure"]:checked').val();
        const has_flowers = document.getElementById('has_flowers').checked;
        const colour = document.getElementById('flower_colour').value;
        const leaf_type = $('input[name="leaf_type"]:checked').val();
        const seed_type = $('input[name="seed_type"]:checked').val();

        const details = {
            height,
            spread,
            sun_exposure,
            has_flowers,
            colour,
            leaf_type,
            seed_type
        };

        const imageInput = document.getElementById('images');
        const images = imageInput.files;

        if (images.length > 10) {
            alert('You can only upload a maximum of 10 images');
            return;
        }

        //Prepare formData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('seen_at', seen_at);
        formData.append('description', description);
        formData.append('location_name', location_name);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('height', height);
        formData.append('spread', spread);
        formData.append('sun_exposure', sun_exposure);
        formData.append('has_flowers', has_flowers);
        formData.append('flower_colour', colour);
        formData.append('leaf_type', leaf_type);
        formData.append('seed_type', seed_type);
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

        const response = await axios.post('/post', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        $postButton.removeClass('disabled');
        $postSpinner.addClass('d-none');

        window.location.href = `/plant/${response.data._id}`;

    } catch (error) {
        console.error(error);
    }

}