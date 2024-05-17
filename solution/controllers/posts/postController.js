const {
    getPostById,
    addComment,
    getCommentFromPost,
    addReply,
    findComment,
    addSuggestion,
    getSuggestionFromPost,
    findSuggestion,
    getUserById, createPost, updateUser,
    addNotification, deleteLikeNotificationByCommentId,
} = require("../../model/mongodb");
const postStates = require("../../model/enum/postStates");
const leafTypes = require("../../model/enum/leafTypes");
const exposureTypes = require("../../model/enum/exposureTypes");
const seedTypes = require("../../model/enum/seedTypes");
const notificationTypes = require("../../model/enum/notificationTypes")

const mongoose = require("mongoose");
const mongodb = require("../../model/mongodb");
const axios = require('axios');

const socket = require("../socket/socket.io")

async function getPost(req, res) {
    const userId = req.user.id;
    const user = await getUserById(userId);
    res.render('posts/create_post', {
        title: 'Post',
        isLoggedIn: req.isLoggedIn,
        user: user,
        leafTypes,
        exposureTypes,
        seedTypes
    });
}

async function postNewPost(req, res, next) {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const seen_at = req.body.seen_at;

        const location_name = req.body.location_name;
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;

        const height = req.body.height;
        const spread = req.body.spread;
        const sun_exposure = req.body.sun_exposure;
        const has_flowers = req.body.has_flowers;
        const colour = req.body.flower_colour;
        const leaf_type = req.body.leaf_type;
        const seed_type = req.body.seed_type;

        const images = req.files;

        const identifiedAs = req.body.identifiedAs;

        //Check fields exist and are not empty
        if (!title || !description || !seen_at || !height || !spread || !sun_exposure || !has_flowers || !colour || !leaf_type || !seed_type || !location_name || !latitude || !longitude) {
            res.status(400);
            res.send("Missing fields");
            return;
        }

        //Flower colour should arrive as a hex code encoded as a string, so we need to convert it to a number

        const flower_colour = parseInt(colour.replace("#", ""), 16);

        //If an identification has been made, set the state to IN_PROGRESS
        const state = (!identifiedAs) ? postStates.NEW_POST : postStates.IN_PROGRESS;

        const userId = req.user.id;

        let imgData = [];
        if (images) {
            imgData = images.map(image => {
                return {
                    image_type: image.mimetype,
                    image_data: image.buffer
                }
            });
        }

        const locationData = {
            location_name: location_name,
            latitude: latitude,
            longitude: longitude
        };

        const potentials = [];
        if (identifiedAs) {
            const potentialData =
                {
                    name: identifiedAs,
                    suggesting_user: userId,
                    upvotes: 1,
                    downvotes: 0,
                    upvoters: [userId],
                    downvoters: []
                }
            potentials.push(potentialData);
        }


        const identificationData = {
            potentials: potentials,
            is_accepted: false,
            date_accepted: null,
            accepted_potential: null,
            dbpedia_url: ""
        }

        const postObject = {
            posting_user: userId,
            title: title,
            state: state,
            seen_at: seen_at,
            images: imgData,
            description: description,
            location: locationData,
            details: {
                height: height,
                spread: spread,
                exposure: sun_exposure,
                has_flowers: has_flowers,
                colour: flower_colour,
                leaf_type: leaf_type,
                seed_type: seed_type
            },
            identification: identificationData,
            comments: [],
        }

        const post = await createPost(postObject);
        socket.broadcastNewPost({post})

        const user = await getUserById(userId); // Get the user by ID

// Add the ObjectId of the newly created post to the user's posts array
        user.posts.push(post._id);

// Save the updated user document
        await updateUser(userId, user);

        res.status(200).send(post);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
}

async function getPlant(req, res, next) {
    //Get the post ID from the URL
    const id = req.params.id

    //Check if the ID is valid
    if (!id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    try {
        const post = await getPostById(id)
        res.render('posts/plant_details', {
            title: 'Plant',
            plant: post,
            postStates,
            exposureTypes,
            leafTypes,
            seedTypes,
            upvotesDownvotesAsAPercentage,
            user: req.user,
            isLoggedIn: req.isLoggedIn
        })
    } catch (err) {
        console.log(err)
        res.status(500);
        next(err);
    }
}

async function postComment(req, res, next) {
    //Get the post ID from the URL
    const plant_id = req.params.id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.user_id;
    // The temp_id is used to identify the comment in the IndexedDB of the posting user
    const temp_id = req.body.temp_id;

    //Check if the ID is valid
    if (!plant_id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    if (!text) {
        res.status(400);
        res.send("Invalid body");
        return;
    }
    try {
        const {post, notification} = await addComment(plant_id, {userID: user_id, content: text, likes: 0, client_temp_id: temp_id})
        res.status(200).json({post, notification});
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getCommentHTML(req, res) {
    try {
        //Get the plant_id and comment_id from the URL
        const plant_id = req.params.plant_id;
        const comment_id = req.params.comment_id;

        const userId = req.user.id;

        //Get the comment from the post
        const comment = await getCommentFromPost(plant_id, comment_id);

        const user = await getUserById(userId); // Get the user by ID
        //Render the comment HTML from the EJS template
        res.render('posts/comment', {
            comment: comment,
            user,
            isReply: false
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postReply(req, res) {
    //Get the post ID from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.user_id;
    // The temp_id is used to identify the comment in the IndexedDB of the posting user
    const temp_id = req.body.temp_id;

    //Check if the ID is valid
    if (!plant_id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    if (!comment_id) {
        res.status(400);
        res.send("Invalid comment ID");
        return;
    }

    if (!text) {
        res.status(400);
        res.send("Invalid body");
        return;
    }

    try {
        const {reply, notification} = await addReply(plant_id, comment_id, {userID: user_id, content: text, likes: 0, client_temp_id: temp_id})
        res.status(200).json({reply, notification});
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getReplyHTML(req, res) {
    try {
        //Get the plant_id, comment_id, and reply_id from the URL
        const plant_id = req.params.plant_id;
        const comment_id = req.params.comment_id;
        const reply_id = req.params.reply_id;

        const userId = req.user.id;

        //Get the comment from the post
        const comment = await getCommentFromPost(plant_id, reply_id);

        const user = await getUserById(userId); // Get the user by ID

        //Render the comment HTML from the EJS template
        res.render('posts/comment', {
            comment: comment,
            user,
            isReply: true
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postLike(req, res) {
    try {
        //Get the plant_id and comment_id from the URL
        const plant_id = req.params.plant_id;
        const comment_id = req.params.comment_id;

        const userID = req.body.user_id;

        //Get the comment from the post
        const post = await getPostById(plant_id);
        const comment = findComment(post.comments, comment_id);

        //Increment the likes
        comment.likes += 1;
        comment.likers.push(userID);

        //Save the post
        await post.save();

        // Send notification
        const notification = await addNotification(post._id, comment.user, notificationTypes.NEW_LIKE, post.title, comment.content, userID, comment._id)

        res.status(200).json({comment, notification});
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }

}

async function postUnlike(req, res) {
    try {
        //Get the plant_id and comment_id from the URL
        const plant_id = req.params.plant_id;
        const comment_id = req.params.comment_id;

        const userID = req.body.user_id;

        const post = await getPostById(plant_id);

        //Get the comment from the post
        const comment = findComment(post.comments, comment_id);

        //Increment the likes
        comment.likes -= 1;
        comment.likers = comment.likers.filter(id => id.toString() !== userID.toString());

        //Save the post
        await post.save();
        const notification = await deleteLikeNotificationByCommentId(comment._id)
        res.status(200).json({comment, notification});
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postSuggestion(req, res) {
    //Get the plant_id from the URL
    const plant_id = req.params.plant_id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.user_id;

    //Check if the ID is valid
    if (!plant_id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    if (!text) {
        res.status(400);
        res.send("Invalid body");
        return;
    }

    try {
        const {suggestion, notification} = await addSuggestion(plant_id, {userID: user_id, name: text})

        const post = await getPostById(plant_id);
        post.state = postStates.IN_PROGRESS;
        await post.save();
        res.status(200).json({suggestion, notification});
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getSuggestionHTML(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const post = await getPostById(plant_id);
        //Get the suggestion from the post
        const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

        //Render the suggestion HTML from the EJS template
        res.render('posts/suggestion', {
            suggestion: suggestion,
            identification: post.identification,
            user: req.user,
            upvotesDownvotesAsAPercentage,
            isPoster: (suggestion.suggesting_user.toString() === "6605a97814ddcdf43b5697d4")
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postUpvote(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const userID = req.body.user_id;

        //Get the suggestion from the post
        const post = await getPostById(plant_id);
        const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

        //Increment the likes
        suggestion.upvotes += 1;
        suggestion.upvoters.push(userID);

        //Save the post
        await post.save();

        res.status(200).send(suggestion);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});

    }
}

async function postUnupvote(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const userID = req.body.user_id;

        const post = await getPostById(plant_id);

        //Get the suggestion from the post
        const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

        //Increment the likes
        suggestion.upvotes -= 1;
        suggestion.upvoters = suggestion.upvoters.filter(id => id.toString() !== userID.toString());

        //Save the post
        await post.save();

        res.status(200).json(suggestion);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postDownvote(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const userID = req.body.user_id;

        //Get the suggestion from the post
        const post = await getPostById(plant_id);
        const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

        //Increment the likes
        suggestion.downvotes += 1;
        suggestion.downvoters.push(userID);

        //Save the post
        await post.save();

        res.status(200).send(suggestion);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }

}

async function postUndownvote(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const userID = req.body.user_id;

        const post = await getPostById(plant_id);

        //Get the suggestion from the post
        const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

        //Increment the likes
        suggestion.downvotes -= 1;
        suggestion.downvoters = suggestion.downvoters.filter(id => id.toString() !== userID.toString());

        //Save the post
        await post.save();

        res.status(200).send(suggestion);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postAcceptSuggestion(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const post = await getPostById(plant_id);

        //Get the index of the suggestion in the potentials array
        const index = post.identification.potentials.findIndex(suggestion => suggestion._id.toString() === suggestion_id);

        //Set is_accepted to true
        post.identification.is_accepted = true;
        post.identification.date_accepted = new Date();
        post.identification.accepted_potential = index;
        post.identification.accepted_potential_id = post.identification.potentials[index]._id;

        post.state = postStates.IDENTIFIED;

        //TODO: Add the dbpedia URL once available

        //Save the post
        await post.save();

        res.status(200).send(post);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

async function postUnacceptSuggestion(req, res) {
    try {
        //Get the plant_id and suggestion_id from the URL
        const plant_id = req.params.plant_id;
        const suggestion_id = req.params.suggestion_id;

        const post = await getPostById(plant_id);

        //Set is_accepted to false
        post.identification.is_accepted = false;
        post.identification.date_accepted = null;
        post.identification.accepted_potential = null;
        post.identification.accepted_potential_id = null;

        post.state = postStates.IN_PROGRESS;

        await post.save();

        res.status(200).send(post);
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e});
    }
}

function upvotesDownvotesAsAPercentage(upvotes, downvotes) {
    const total = upvotes + downvotes;
    if (total === 0) {
        return {upvote: 50, downvote: 50};
    }

    const upvotePercentage = Math.floor((upvotes / total) * 100);
    const downvotePercentage = 100 - upvotePercentage;

    return {upvote: upvotePercentage, downvote: downvotePercentage};
}

async function getDBPediaInfo(req, res) {
    //Get the suggestion ID from the parameters
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    //Get the suggestion from the post
    const suggestion = await getSuggestionFromPost(plant_id, suggestion_id);

    if (!suggestion) {
        res.status(404);
        res.send("Invalid suggestion ID");
        return;
    }

    //Get the name of the plant from the suggestion
    const plantName = suggestion.name;

    //First, we need to check if any DBPedia records exist for the plant
    const endpoint = `https://dbpedia.org/sparql`;

    const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    
    SELECT DISTINCT ?plant ?description ?thumbnail
    WHERE {
      ?plant rdf:type dbo:Plant ;
             rdfs:label ?name ;
             dbo:abstract ?description .
      OPTIONAL { ?plant dbo:thumbnail ?thumbnail . }
      FILTER (LANG(?name) = "en" && LANG(?description) = "en" && REGEX(?name, "${plantName}", "i"))
    }`;

    const encodedQuery = encodeURIComponent(query);

    const url = `${endpoint}?query=${encodedQuery}&format=json`;

    try {
        const response = await axios.get(url);

        let bindings = response.data.results.bindings;

        //If no results are found, return an empty object
        if (bindings.length === 0) {
            res.status(404).json({});
            return;
        }

        //Find the result that most closely matches the plant name
        bindings = bindings.sort(function (a, b) {
            const aDistance = levenshteinDistance(plantName, a.plant.value);
            const bDistance = levenshteinDistance(plantName, b.plant.value);

            return aDistance - bDistance;

        });

        let closest = bindings[0];

        //Return the closest result
        res.status(200).json({
            plant: closest.plant.value,
            description: closest.description.value,
            thumbnail: closest.thumbnail ? closest.thumbnail.value : ""
        });


    } catch (e) {
        console.log(e);
        res.status(500).json({error: e});
    }
}

/**
 * Calculate the Levenshtein distance between two strings.
 * This distance function is used to compare the similarity between two strings.
 * @see https://en.wikipedia.org/wiki/Levenshtein_distance
 * @param str1 The first string
 * @param str2 The second string
 * @returns {*} The Levenshtein distance between the two strings
 */
function levenshteinDistance(str1, str2) {
    // Calculate the lengths of the input strings
    const length1 = str1.length;
    const length2 = str2.length;

    // Initialize the distance matrix
    const distanceMatrix = [];

    // Initialize the first row of the matrix (for str1 to empty string)
    for (let i = 0; i <= length1; i++) {
        distanceMatrix[i] = [];
        distanceMatrix[i][0] = i;
    }

    // Initialize the first column of the matrix (for empty string to str2)
    for (let j = 0; j <= length2; j++) {
        distanceMatrix[0][j] = j;
    }

    // Populate the rest of the matrix using dynamic programming
    for (let i = 1; i <= length1; i++) {
        for (let j = 1; j <= length2; j++) {
            // If characters at the current positions are the same, no edit is needed
            if (str1[i - 1] === str2[j - 1]) {
                distanceMatrix[i][j] = distanceMatrix[i - 1][j - 1];
            } else {
                // Calculate the costs for different edit operations
                const substitutionCost = distanceMatrix[i - 1][j - 1] + 1;
                const insertionCost = distanceMatrix[i][j - 1] + 1;
                const deletionCost = distanceMatrix[i - 1][j] + 1;
                // Choose the minimum cost among the three options
                distanceMatrix[i][j] = Math.min(substitutionCost, insertionCost, deletionCost);
            }
        }
    }

    // Return the Levenshtein distance between the two strings
    return distanceMatrix[length1][length2];
}


module.exports = {
    getPost,
    postNewPost,
    getPlant,
    postComment,
    getCommentHTML,
    postReply,
    getReplyHTML,
    postLike,
    postUnlike,
    postSuggestion,
    getSuggestionHTML,
    postUpvote,
    postUnupvote,
    postDownvote,
    postUndownvote,
    postAcceptSuggestion,
    postUnacceptSuggestion,
    getDBPediaInfo
}
