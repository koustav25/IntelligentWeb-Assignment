let map;
let postMarker;

socket = io();

let actionInProgress = false;
let identificationHasChanged = false;

let lastConnectedTime;

let suggestionButton;

document.addEventListener('DOMContentLoaded', function () {
    //Initialise Socket.io
    registerSocketListeners();

    //Prepare the map and set the view to the post's coordinates
    map = L.map('map').setView([postCoords.latitude, postCoords.longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    postMarker = L.marker([postCoords.latitude, postCoords.longitude]).addTo(map);

    postMarker.setIcon(L.divIcon({
        className: 'post-map-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
        html: '<i class="fa-solid fa-leaf fa-2x text-success"></i>'
    }));

    //Get the current user's location and add another marker to the map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userMarker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);

            //Calculate the distance between the user and the post
            const distance = userMarker.getLatLng().distanceTo(postMarker.getLatLng());

            //Calculate the string to show, either as meters or kilometers depending on the distance
            let distanceString = distance < 1000 ? `${distance.toFixed(2)}m` : `${(distance / 1000).toFixed(2)}km`;

            //Add a popup to the user marker with the distance
            userMarker.bindPopup(`You are ${distanceString} away from the plant`).openPopup();

            //Change the marker icon to a red icon
            userMarker.setIcon(L.divIcon({
                className: 'user-map-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10],
                html: '<i class="fa-solid fa-user fa-2x text-primary-emphasis"></i>'
            }));

            //Move the market backwards so it is behind the post marker
            userMarker.setZIndexOffset(-1);

            //Center the map back on the post marker
            map.setView(postMarker.getLatLng());

            //Zoom out slightly so both markers are visible if the user is close to the post
            map.setZoom(12);
        });
    }


    //On suggestion modal closed,
    $('#suggestIdentificationModal').on('hidden.bs.modal', function () {
        //If identification has changed, refresh the page
        if (identificationHasChanged) {
            location.reload();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    suggestionButton = $('#suggestIdentificationButton');

    const offlineIcon = `
    <div class="fa-stack text-white my-auto p-0 m-0 px-2 fa-1x">
        <i class="fa-solid fa-wifi fa-stack-1x my-0 py-0"></i>
        <i class="fa-solid fa-slash text-warning fw-bold fa-stack-1x my-0 py-0" style="opacity: 100%"></i>
    </div>
    `

    //When online, enable the suggestion button and make sure its text is "Suggest Identification"
    //When offline, disable the suggestion button and make sure its text is "Suggestions Unavailable Offline"

    if (isOnline) {
        suggestionButton.prop('disabled', false);
        suggestionButton.text('Suggest Identification');
    } else {
        suggestionButton.prop('disabled', true);

        suggestionButton.html(offlineIcon + ' Suggestions Unavailable Offline');
    }

    window.addEventListener('online', function () {
        suggestionButton.prop('disabled', false);
        suggestionButton.text('Suggest Identification');
    });

    window.addEventListener('offline', function () {
        suggestionButton.prop('disabled', true);

        suggestionButton.html(offlineIcon + ' Suggestions Unavailable Offline');
    });
});

document.addEventListener('DOMContentLoaded', async function () {
    //Once the page has loaded, we need to get any pending comments from the IndexedDB and add them to the page
    const db = await openCommentsIdb();
    const comments = await getCommentsFromIdb(db);

    for (const comment of comments) {
        addPlaceholderCommentToPage(comment);
    }

    window.addEventListener('offline', async () => {
        //When we go offline, we need to store the time we went offline
        lastConnectedTime = new Date();
    });

    window.addEventListener('online', async () => {
        //Once we are back online, we need to check for any comments that may be on the server since we went offline
        try {
            const response = await axios.get(`/api/plant/${plantID}/comment/since?time=${lastConnectedTime.toISOString()}`);

            for (const comment of response.data) {
                await addCommentToPage(comment._id, comment.client_temp_id);
            }

            //Once all of the comments have been loaded, we then need to look for new replies on old comments
            const replyResponse = await axios.get(`/api/plant/${plantID}/replies/since?time=${lastConnectedTime.toISOString()}`);

            for (const reply of replyResponse.data) {
                await addReplyToPage(reply.commentId, reply.reply._id, reply.reply.client_temp_id);
            }
        } catch (err) {
            console.error(err);
        }
    });
});


function registerSocketListeners() {
    socket.on('new_suggestion', async (data) => {
        console.log('new_suggestion')
        await addSuggestionToPage(data._id);
    });

    socket.on('suggestion_rating', (data) => {
        console.log('suggestion_rating')
        updateUpvoteUI(data.suggestionID, data.upvotes, data.downvotes)
    });

    socket.on('new_comment', async (data) => {
        console.log('new_comment')
        await addCommentToPage(data._id, data.client_temp_id);
    });

    socket.on('new_reply', async (data) => {
        console.log('new_reply')
        await addReplyToPage(data.comment_id, data.reply._id, data.reply.client_temp_id);
    });

    socket.on('like_count', (data) => {
        console.log('like_count')
        const likesCount = $(`#comment_${data.commentID}_likes`);
        likesCount.text(data.likes);
    });

    socket.on('connect', () => {
        console.log('Connected to server (Socket.io)');
        socket.emit('viewing_plant', {plant_id: plantID});
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server (Socket.io)');
        socket.emit('leaving_plant', {plant_id: plantID});
    });

    window.addEventListener('beforeunload', function (event) {
        socket.emit('leaving_plant', {plant_id: plantID});
    });
}

/**
 * Generates a random alphanumeric ID using the alphabet provided (a-z, A-Z, 0-9)
 * @returns {string} The generated ID
 */
function generateRandomId() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 24; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
}

/**
 * Handles adding a new comment. This function is called when the user clicks the "Add Comment" button
 * This places a placeholder comment on the page and then sends a request to the server to add the comment
 * @returns {Promise<void>}
 */
async function addNewComment() {
    const newCommentText = document.getElementById('addCommentText').value;

    if (newCommentText === '') {
        return;
    }

    const newComment = {
        text: newCommentText,
        user_id: userID,
        post_id: plantID,
        submittedAt: Date.now()
    };

    try {
        const tempId = generateRandomId();

        addPlaceholderCommentToPage({
            text: newCommentText,
            temp_id: tempId
        });

        const db = await openCommentsIdb();
        await addCommentToIdb(db, newComment, tempId);


        //Clear the comment text box
        $('#addCommentText').val('');
    } catch (err) {
        console.error(err);
    }
}

/**
 * Handles adding a new reply. This function is called when the user clicks the "Add Reply" button
 * This places a placeholder reply on the page and then sends a request to the server to add the reply
 * @returns {Promise<void>}
 */
async function addNewReply() {
    const commentID = document.getElementById('replyToCommentID').value;
    const newReplyText = document.getElementById('replyText').value;

    if (newReplyText === '') {
        return;
    }

    const newReply = {
        text: newReplyText,
        user_id: userID,
        comment_id: commentID,
        plant_id: plantID,
        submittedAt: Date.now()
    };

    try {
        const tempId = generateRandomId();

        addPlaceholderReplyToPage({
            text: newReplyText,
            temp_id: tempId,
            comment_id: commentID
        });

        const db = await openCommentsIdb();
        await addReplyToIdb(db, newReply, tempId);

        //Add the reply to the page
        //await addReplyToPage(commentID, response.data.reply._id.toString());

        $('#replyToCommentModal').modal('hide');
        $('#replyText').val('');
        $('#replyToCommentID').val('');
    } catch (err) {
        console.error(err);
    }

}

/**
 * Generates the HTML for a placeholder comment or reply
 * @param comment The comment object
 * @returns {string} The HTML for the comment
 */
function generateCommentHtml(comment) {
    return `
    <div class="card comment-placeholder" data-temp-id="${comment.temp_id}">
    <div class="card-body p-2 p-lg-3">
        <div class="row">
            <div class="col-12">
                <div class="d-inline-flex justify-content-between align-content-center w-100">
                    <p class="m-0 p-0 align-content-center d-flex">
                        <img class="rounded-5 my-auto mx-1"
                             src="https://ui-avatars.com/api/?name=You&background=random&color=fff"
                             width="20">
                        <a class="link-hover text-decoration-none fw-medium my-auto px-2"><span
                                    class="fs-6">You</span></a>
                    </p>
                    <p class="m-0 p-0 align-content-center my-auto fs-6">
                        Pending
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                    </p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <p class="m-0 p-0 pt-1 text-wrap">${comment.text}</p>
            </div>
        </div>
    </div>
</div>
    `;

}

/**
 * Generates the HTML for a placeholder comment and places it at the top of the comments container
 * @param comment The comment object
 */
function addPlaceholderCommentToPage(comment) {
    const commentsContainer = document.getElementById('commentsContainer');

    const noCommentsRow = $('#noCommentsRow');
    if (noCommentsRow.is(':visible')) {
        noCommentsRow.hide();
    }

    const newComment = document.createElement('div');
    newComment.classList.add('row', 'pb-1');

    const newCommentCol = document.createElement('div');
    newCommentCol.classList.add('col-12');

    newCommentCol.innerHTML = generateCommentHtml(comment);
    newComment.appendChild(newCommentCol);
    commentsContainer.prepend(newComment);
}

/**
 * Generates the HTML for a placeholder reply and places it at the bottom of the replies container
 * @param reply The reply object
 */
function addPlaceholderReplyToPage(reply) {
    const replySection = $('#reply_section-' + reply.comment_id);

    if (replySection.hasClass('d-none')) {
        replySection.removeClass('d-none');
    }

    const replyContainer = document.getElementById('reply_container-' + reply.comment_id);

    const newReply = document.createElement('div');
    newReply.classList.add('row', 'p-0');

    const newReplyCol = document.createElement('div');
    newReplyCol.classList.add('col-12', 'p-2', 'p-lg-1');

    newReplyCol.innerHTML = generateCommentHtml(reply);
    newReply.appendChild(newReplyCol);
    replyContainer.appendChild(newReply);

}

/**
 * Adds a comment retrieved from the server to the page.
 * This function is called when a new comment is received from the server.
 * The comment is added to the top of the comments container and also removes any placeholder comments that correspond to the comment
 * @param commentID The ID of the comment
 * @param tempID The temporary ID of the comment placeholder
 * @returns {Promise<void>}
 */
async function addCommentToPage(commentID, tempID) {
    //Make a request to the /plant/:plant_id/comment/:comment_id/render route to get the HTML for the comment
    try {
        const response = await axios.get(`/plant/${plantID}/comment/${commentID}/render`);

        //Check to see if the comment already exists on the page
        const existingComment = $(`#comment_${commentID}`);
        if (existingComment.length > 0) return;

        //Get the comments container
        const commentsContainer = document.getElementById('commentsContainer');

        const noCommentsRow = $('#noCommentsRow');
        //If the no comments row is visible, hide it
        if (noCommentsRow.is(':visible')) {
            noCommentsRow.hide();
        }

        //First, check if a placeholder comment exists and remove it
        const placeholder = $(`.comment-placeholder[data-temp-id=${tempID}]`);

        if (placeholder.length > 0) {
            placeholder.remove();
        }

        //Create a new div element
        const newComment = document.createElement('div');
        //Add the row pb-1 classes to the new div
        newComment.classList.add('row', 'pb-1');

        //Create a col-12 div inside the new div
        const newCommentCol = document.createElement('div');
        newCommentCol.classList.add('col-12');

        //Set the innerHTML of the new div to the response data
        newCommentCol.innerHTML = response.data;

        //Append the new div to the start of the comments container
        newComment.appendChild(newCommentCol);
        commentsContainer.prepend(newComment);
    } catch (err) {
        console.log(err)
    }
}

/**
 * Adds a reply retrieved from the server to the page.
 * This function is called when a new reply is received from the server.
 * The reply is added to the bottom of the replies container and also removes any placeholder replies that correspond to the reply
 * @param commentID The ID of the parent comment
 * @param replyID The ID of the reply
 * @param tempID The temporary ID of the reply placeholder
 * @returns {Promise<void>}
 */
async function addReplyToPage(commentID, replyID, tempID) {
    //Make a request to the /plant/:plant_id/comment/:comment_id/reply/:reply_id/render route to get the HTML for the comment
    try {
        const response = await axios.get(`/plant/${plantID}/comment/${commentID}/reply/${replyID}/render`);

        //Check to see if the reply already exists on the page
        const existingReply = $(`#reply_${replyID}`);
        if (existingReply.length > 0) return;

        const $replySection = $(`#reply_section-${commentID}`);

        if ($replySection.hasClass('d-none')) {
            $replySection.removeClass('d-none');
        }

        //Get the replies container
        const replyContainer = document.getElementById('reply_container-' + commentID);

        //First, check if a placeholder comment exists and remove it
        const placeholder = $(`.comment-placeholder[data-temp-id=${tempID}]`);

        if (placeholder.length > 0) {
            placeholder.remove();
        }

        //Create a new div element
        const newComment = document.createElement('div');
        //Add the row pb-1 classes to the new div
        newComment.classList.add('row', 'p-0');

        //Create a col-12 div inside the new div
        const newCommentCol = document.createElement('div');
        newCommentCol.classList.add('col-12', 'p-2', 'p-lg-1');

        //Set the innerHTML of the new div to the response data
        newCommentCol.innerHTML = response.data;

        //Append the new div to the start of the comments container
        newComment.appendChild(newCommentCol);
        replyContainer.appendChild(newComment);

        $replySection.removeClass('d-none');
    } catch (err) {
        console.log(err)
    }
}

/**
 * Toggles the like button for a comment
 * This function is called when the like button is pressed
 * It sends a request to the server to like or unlike the comment and then updates the UI accordingly
 * If the request fails, the UI is reverted back to its original state
 * @param commentID The ID of the comment
 * @returns {Promise<void>}
 */
async function toggleLikeButton(commentID) {
    const likeIndicator = $(`#comment_${commentID}_like_indicator`);
    const likesCount = $(`#comment_${commentID}_likes`);

    const hasLiked = likeIndicator.hasClass('text-danger');
    const likes = parseInt(likesCount.text());

    const data = {
        user_id: userID
    }

    let success = false;

    if (hasLiked) {
        likeIndicator.removeClass('text-danger');
        likeIndicator.removeClass('fa-solid');
        likeIndicator.addClass('fa-regular');
        likesCount.text(likes - 1);
    } else {
        likeIndicator.addClass('text-danger');
        likeIndicator.removeClass('fa-regular');
        likeIndicator.addClass('fa-solid');
        likesCount.text(likes + 1);
    }

    try {
        if (hasLiked) {
            const response = await axios.post(`/plant/${plantID}/comment/${commentID}/unlike`, data);
            socket.emit("delete_notification", response.data.notification)

        } else {
            const response = await axios.post(`/plant/${plantID}/comment/${commentID}/like`, data);
            socket.emit("new_notification", response.data.notification)
        }

        socket.emit('like_count', plantID, {
            commentID: commentID,
            likes: data.likes
        });

        success = true;
    } catch (err) {
        success = false;
        console.log(err)
    } finally {
        if (!success) {
            if (hasLiked) {
                likeIndicator.addClass('text-danger');
                likeIndicator.removeClass('fa-regular');
                likeIndicator.addClass('fa-solid');
                likesCount.text(likes);
            } else {
                likeIndicator.removeClass('text-danger');
                likeIndicator.removeClass('fa-solid');
                likeIndicator.addClass('fa-regular');
                likesCount.text(likes);
            }
        }
    }

}

/**
 * Submits a new plant identification suggestion to the server
 * @returns {Promise<void>}
 */
async function submitSuggestion() {
    if (actionInProgress) {
        return;
    }

    actionInProgress = true;

    const suggestionText = document.getElementById('suggestionText').value;

    if (suggestionText === '') {
        return;
    }

    const newSuggestion = {
        text: suggestionText,
        user_id: userID,
    }

    try {
        const response = await axios.post(`/plant/${plantID}/suggestion`, newSuggestion);
        socket.emit('new_suggestion', plantID, response.data.suggestion);

        socket.emit("new_notification", response.data.notification)

        await addSuggestionToPage(response.data.suggestion._id);

    } catch (err) {
        console.error(err);
    } finally {
        actionInProgress = false;
    }
}

/**
 * Adds a suggestion to the page by making a request to the server to render the suggestion HTML.
 * This function is called when a new suggestion is received from the server.
 * @param suggestionID
 * @returns {Promise<void>}
 */
async function addSuggestionToPage(suggestionID) {
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    const noSuggestionsRow = $('#noSuggestionsRow');
    if (noSuggestionsRow.is(':visible')) {
        noSuggestionsRow.hide();
    }

    try {
        const response = await axios.get(`/plant/${plantID}/suggestion/${suggestionID}/render`);

        const newSuggestion = document.createElement('div');

        newSuggestion.innerHTML = response.data;

        suggestionsContainer.appendChild(newSuggestion);
    } catch (err) {
        console.log(err)
    }
}

/**
 * Updates the UI for the upvote/downvote progress bars and counts
 * This function is called when a user upvotes a suggestion.
 * If the request to the server fails, the UI is reverted back to its original state
 * @param suggestionID
 * @returns {Promise<void>}
 */
async function upvoteSuggestion(suggestionID) {
    if (actionInProgress) {
        return;
    }

    actionInProgress = true;

    //This function is fired when the upvote button is pressed
    const upvoteIcon = $(`#suggestion_upvote_icon_${suggestionID}`);
    const downvoteIcon = $(`#suggestion_downvote_icon_${suggestionID}`);
    const upvoteCount = $(`#suggestion_upvote_count_${suggestionID}`);
    const downvoteCount = $(`#suggestion_downvote_count_${suggestionID}`);

    const hasUpvoted = upvoteIcon.hasClass('text-success');
    const hasDownvoted = downvoteIcon.hasClass('text-danger');

    const upvotes = parseInt(upvoteCount.text());
    const downvotes = parseInt(downvoteCount.text());

    let success = false;

    try {
        //If the user has upvoted, remove the upvote
        if (hasUpvoted) {
            updateUpvoteUI(suggestionID, upvotes - 1, downvotes);
            upvoteIcon.removeClass('text-success');
            upvoteIcon.addClass('text-muted');

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/unupvote route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unupvote`, {user_id: userID});

            //Emit the upvote count to the server
            socket.emit('suggestion_rating', plantID, {
                suggestionID: suggestionID,
                upvotes: response.data.upvotes,
                downvotes: downvotes
            });

            success = true;
        } else {
            //If the user has not upvoted, first check if they have downvoted
            if (hasDownvoted) {
                //If they have downvoted, remove the downvote
                updateUpvoteUI(suggestionID, upvotes + 1, downvotes - 1)
                downvoteIcon.removeClass('text-danger');
                downvoteIcon.addClass('text-muted');
                upvoteIcon.addClass('text-success');
                upvoteIcon.removeClass('text-muted');

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/undownvote route
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/undownvote`, {user_id: userID});

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/upvote route
                const response2 = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/upvote`, {user_id: userID});

                //Emit the upvote count to the server
                socket.emit('suggestion_rating', plantID, {
                    suggestionID: suggestionID,
                    upvotes: response2.data.upvotes,
                    downvotes: response2.data.downvotes
                });

                success = true;
            } else {
                //If they have not downvoted, just add the upvote
                updateUpvoteUI(suggestionID, upvotes + 1, downvotes)
                upvoteIcon.removeClass('text-muted');
                upvoteIcon.addClass('text-success');

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/upvote route
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/upvote`, {user_id: userID});

                //Emit the upvote count to the server
                socket.emit('suggestion_rating', plantID, {
                    suggestionID: suggestionID,
                    upvotes: response.data.upvotes,
                    downvotes: downvotes
                });

                success = true;
            }
        }
    } catch (err) {
        success = false;
        console.log(err);
    } finally {
        if (!success) {
            if (hasUpvoted) {
                upvoteIcon.addClass('text-success');
                upvoteIcon.removeClass('text-muted');
                updateUpvoteUI(suggestionID, upvotes, downvotes)
            } else {
                if (hasDownvoted) {
                    downvoteIcon.addClass('text-danger');
                    downvoteIcon.removeClass('text-muted');
                }
                updateUpvoteUI(suggestionID, upvotes, downvotes)
                upvoteIcon.removeClass('text-success');
                upvoteIcon.addClass('text-muted');
            }
        }
        actionInProgress = false;
    }
}

/**
 * Updates the UI for the upvote/downvote progress bars and counts
 * This function is called when a user downvotes a suggestion.
 * If the request to the server fails, the UI is reverted back to its original state
 * @param suggestionID
 * @returns {Promise<void>}
 */
async function downvoteSuggestion(suggestionID) {
    if (actionInProgress) {
        return;
    }

    actionInProgress = true;

    //This function is fired when the downvote button is pressed
    const upvoteIcon = $(`#suggestion_upvote_icon_${suggestionID}`);
    const downvoteIcon = $(`#suggestion_downvote_icon_${suggestionID}`);
    const upvoteCount = $(`#suggestion_upvote_count_${suggestionID}`);
    const downvoteCount = $(`#suggestion_downvote_count_${suggestionID}`);

    const hasUpvoted = upvoteIcon.hasClass('text-success');
    const hasDownvoted = downvoteIcon.hasClass('text-danger');

    const upvotes = parseInt(upvoteCount.text());
    const downvotes = parseInt(downvoteCount.text());

    let success = false;

    try {
        //If the user has downvoted, remove the downvote
        if (hasDownvoted) {
            updateUpvoteUI(suggestionID, upvotes, downvotes - 1);
            downvoteIcon.removeClass('text-danger');
            downvoteIcon.addClass('text-muted');

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/undownvote route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/undownvote`, {user_id: userID});

            //Emit the upvote count to the server
            socket.emit('suggestion_rating', plantID, {
                suggestionID: suggestionID,
                upvotes: upvotes,
                downvotes: response.data.downvotes
            });

            success = true;
        } else {
            //If the user has not downvoted, first check if they have upvoted
            if (hasUpvoted) {
                //If they have upvoted, remove the upvote
                updateUpvoteUI(suggestionID, upvotes - 1, downvotes + 1)
                upvoteIcon.removeClass('text-success');
                upvoteIcon.addClass('text-muted');
                downvoteIcon.addClass('text-danger');
                downvoteIcon.removeClass('text-muted');

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/unupvote route
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unupvote`, {user_id: userID});

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/downvote route
                const response2 = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/downvote`, {user_id: userID});

                //Emit the upvote count to the server
                socket.emit('suggestion_rating', plantID, {
                    suggestionID: suggestionID,
                    upvotes: response.data.upvotes,
                    downvotes: response2.data.downvotes
                });

                success = true;

            } else {
                //If they have not upvoted, just add the downvote
                updateUpvoteUI(suggestionID, upvotes, downvotes + 1)
                downvoteIcon.addClass('text-danger');
                downvoteIcon.removeClass('text-muted');

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/downvote route
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/downvote`, {user_id: userID});

                //Emit the upvote count to the server
                socket.emit('suggestion_rating', plantID, {
                    suggestionID: suggestionID,
                    upvotes: upvotes,
                    downvotes: response.data.downvotes
                });

                success = true;
            }
        }
    } catch (err) {
        success = false;
        console.log(err);
    } finally {
        if (!success) {
            if (hasDownvoted) {
                downvoteIcon.addClass('text-danger');
                downvoteIcon.removeClass('text-muted');
                updateUpvoteUI(suggestionID, upvotes, downvotes)
            } else {
                if (hasUpvoted) {
                    upvoteIcon.addClass('text-success');
                    upvoteIcon.removeClass('text-muted');
                }
                updateUpvoteUI(suggestionID, upvotes, downvotes)
                downvoteIcon.removeClass('text-danger');
                downvoteIcon.addClass('text-muted');
            }
        }
        actionInProgress = false;
    }
}

/**
 * Helper function to update the UI for the upvote/downvote progress bars and counts
 * @param suggestionID The ID of the suggestion
 * @param upvotes The number of upvotes
 * @param downvotes The number of downvotes
 */
function updateUpvoteUI(suggestionID, upvotes, downvotes) {
    const upvoteProgress = $(`#suggestion_upvote_progress_${suggestionID}`);
    const downvoteProgress = $(`#suggestion_downvote_progress_${suggestionID}`);
    const upvoteCount = $(`#suggestion_upvote_count_${suggestionID}`);
    const downvoteCount = $(`#suggestion_downvote_count_${suggestionID}`);

    const newWidths = upvotesDownvotesAsAPercentage(upvotes, downvotes);
    upvoteProgress.css('width', `${newWidths.upvote}%`);
    downvoteProgress.css('width', `${newWidths.downvote}%`);
    upvoteCount.text(upvotes);
    downvoteCount.text(downvotes);
}

/**
 * Accepts a suggestion and sends a request to the server to accept the suggestion.
 * Upon success, the suggestion is marked as accepted and the accept button is hidden.
 * If the request fails, the UI is reverted back to its original state.
 * @param suggestionID The ID of the suggestion
 * @returns {Promise<void>}
 */
async function acceptSuggestion(suggestionID) {
    if (actionInProgress) {
        return;
    }

    actionInProgress = true;

    const suggestionRow = $(`#${suggestionID}`);

    const suggestionAcceptCol = $(`#accept-col-${suggestionID}`);

    const suggestionAcceptIcon = suggestionAcceptCol.find('i');

    const allAcceptCols = $('.accept-col');

    const isAccepted = suggestionAcceptIcon.hasClass('fa-solid');

    let success = false;
    try {
        if (isAccepted) {
            //If the suggestion is already accepted, remove the accepted icon and send a request to the server to unaccept the suggestion
            suggestionAcceptIcon.removeClass('fa-solid');
            suggestionAcceptIcon.addClass('fa-regular');

            suggestionRow.removeClass('bg-success-subtle');

            //Show the accept buttons for all suggestions again
            allAcceptCols.each((i, col) => {
                $(col).removeClass('d-none');
            });

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/unaccept route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unaccept`, {user_id: userID});

            //Emit the suggestion_unaccepted event to the server
            socket.emit('suggestion_unaccepted', plantID, {suggestionID: suggestionID});

            success = true;
        } else {
            //If the suggestion is not accepted, add the accepted icon and send a request to the server to accept the suggestion
            suggestionAcceptIcon.addClass('fa-solid');
            suggestionAcceptIcon.removeClass('fa-regular');

            suggestionRow.addClass('bg-success-subtle');

            //Hide the accept buttons for all suggestions apart from the one that was accepted
            allAcceptCols.each((i, col) => {
                if ($(col).attr('id') !== `accept-col-${suggestionID}`) {
                    $(col).addClass('d-none');
                }
            });

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/accept route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/accept`, {user_id: userID});

            //Emit the suggestion_accepted event to the server
            socket.emit('suggestion_accepted', plantID, {suggestionID: suggestionID});

            success = true;
        }

    } catch (err) {
        console.log(err);
    } finally {
        if (!success) {
            if (isAccepted) {
                suggestionAcceptIcon.addClass('fa-solid');
                suggestionAcceptIcon.removeClass('fa-regular');

                suggestionRow.addClass('bg-success-subtle');

                allAcceptCols.each((i, col) => {
                    col.addClass('d-none');
                });
            } else {
                suggestionAcceptIcon.removeClass('fa-solid');
                suggestionAcceptIcon.addClass('fa-regular');

                suggestionRow.removeClass('bg-success-subtle');

                allAcceptCols.each((i, col) => {
                    $(col).removeClass('d-none');
                });
            }
        } else {
            identificationHasChanged = true;
        }

        actionInProgress = false;
    }
}

/**
 * Helper function to calculate the upvote/downvote percentages for a suggestion
 * This is used to generate the widths of the progress bars that make up the upvote/downvote bars
 * @param upvotes The number of upvotes
 * @param downvotes The number of downvotes
 * @returns {{downvote: number, upvote: number}} The upvote and downvote percentages
 */
function upvotesDownvotesAsAPercentage(upvotes, downvotes) {
    const total = upvotes + downvotes;
    if (total === 0) {
        return {
            upvote: 50,
            downvote: 50
        };
    }

    const upvotePercentage = Math.floor((upvotes / total) * 100);
    const downvotePercentage = 100 - upvotePercentage;

    return {
        upvote: upvotePercentage,
        downvote: downvotePercentage
    };
}

/**
 * Opens the reply modal for a comment
 * @param commentID The ID of the comment
 */
function openReplyModal(commentID) {
    $('#replyToCommentID').val(commentID);
    $('#replyToCommentModal').modal('show');
}

//When the page is loaded, if the user has accepted a suggestion, we need to retrieve the DBPedia information for the plant.
//This also handles offline degradation as an error will be displayed if the request fails.
document.addEventListener('DOMContentLoaded', async () => {
    if (!hasAcceptedSuggestion) return;

    if (typeof acceptedIdentificationID === 'undefined' || acceptedIdentificationID === null) return;

    try {
        const response = await axios.get(`/plant/${plantID}/suggestion/${acceptedIdentificationID}/dbpedia`)

        const data = response.data;
        const dbPediaName = document.getElementById('dbPediaName');
        const dbPediaDescription = document.getElementById('dbPediaDescription');
        const dbPediaImage = document.getElementById('dbPediaImage');
        const dbPediaLink = document.getElementById('dbPediaLink');

        dbPediaName.innerText = data.plant.replace("http://dbpedia.org/resource/", "");
        dbPediaDescription.innerText = data.description;
        dbPediaImage.src = data.thumbnail;
        dbPediaLink.href = data.plant;

        $('#dbPediaSpinner').collapse('hide');
        $('#dbpediaContent').collapse('show');
    } catch (error) {
        console.error(error);

        //Check response code
        if (error.response.status === 404) {
            $('#dbPediaFailedMessage').text('Failed to retrieve information from DBPedia. The plant may not be in the database.');
        } else if (error.response.status === 503) {
            $('#dbPediaFailedMessage').text('Failed to retrieve information from DBPedia. Are you offline?');
        } else {
            $('#dbPediaFailedMessage').text('Failed to retrieve information from DBPedia. An unknown error occurred.');
        }

        $('#dbPediaSpinner').collapse('hide');
        $('#dbPediaFailed').collapse('show');
    }
});