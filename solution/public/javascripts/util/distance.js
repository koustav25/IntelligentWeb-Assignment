function haversine_distance(lat1, lon1, lat2, lon2) {
    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    const R = 6371; // The radius of the earth in km

    const lat_diff = degreesToRadians(lat2-lat1);
    const lon_diff = degreesToRadians(lon2-lon1);

    const sin_lat = Math.sin(lat_diff/2);
    const sin_lon = Math.sin(lon_diff/2);
    const sin_lat_sq = sin_lat * sin_lat;
    const sin_lon_sq = sin_lon * sin_lon;

    //A = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
    const a = sin_lat_sq + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * sin_lon_sq;

    const root_a = Math.sqrt(a);
    const root_1_minus_a = Math.sqrt(1-a);

    //C = 2 * atan2( √a, √(1−a) )
    const c = 2 * Math.atan2(root_a, root_1_minus_a);

    //D = R ⋅ c
    const d = R * c; // The distance in km

    return d;
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}