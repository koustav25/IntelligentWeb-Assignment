const dotenv = require('dotenv');
const parse = require('dotenv-parse-variables');

let env = dotenv.config({path: "./.env"});
if (env.error) throw env.error;
env = parse(env.parsed, {
    assignToProcessEnv: true,
    overrideProcessEnv: true
});

const mongoose = require('mongoose');
const {User} = require("../model/schema/user");
const {Post} = require("../model/schema/post");
const {Notification} = require("../model/schema/notification");

async function convertLocationToGeoJson() {
    const MONGO_USE_LOCAL = process.env.MONGO_USE_LOCAL || false;
    const MONGO_HOST = process.env.MONGO_HOST || "localhost";
    const MONGO_USER = process.env.MONGO_USER || "admin";
    const MONGO_PASS = process.env.MONGO_PASS;
    const MONGO_DBNAME = process.env.MONGO_DBNAME || "test";
    const MONGO_CONNNAME = process.env.MONGO_CONNNAME || "mongodb";


    let connectionString;
    if (MONGO_USE_LOCAL) {
        connectionString = `mongodb://localhost:27017/${MONGO_DBNAME}`;
    } else {
        connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DBNAME}?retryWrites=true&w=majority`;
    }

    /* Variables */
    let connected = false;

    mongoose.connect(connectionString);

    mongoose.connection.on('connected', () => {
        connected = true;
    });

    mongoose.connection.on('error', (err) => {
        console.error(err);
        connected = false;
    });

    const posts = await Post.find({location: {$exists: true}});
    for (let post of posts) {
        console.log("Converting location to GeoJSON format for post: ", post._id);
        const location = post.location.toJSON();

        //Normalize the location to be between -90 and 90
        const newLat = Math.max(-90, Math.min(90, location.latitude));

        //Normalize the longitude to be between -180 and 180
        const newLon = ((location.longitude + 180) % 360 + 360) % 360 - 180;

        const newLocation = {
            location_name: location.location_name,
            coords: {
                type: "Point",
                coordinates: [newLon, newLat]
            }
        }

        post.location = newLocation;
        await post.save();
    }

    console.log("Converted all locations to GeoJSON format");
    mongoose.disconnect();

    process.exit(0);
}

convertLocationToGeoJson();