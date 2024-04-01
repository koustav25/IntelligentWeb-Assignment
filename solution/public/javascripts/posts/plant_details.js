let map;
let postMarker;

let socket = io();

let actionInProgress = false;

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
        await addCommentToPage(data._id);
    });

    socket.on('new_reply', async (data) => {
        console.log('new_reply')
        await addReplyToPage(data.comment_id, data._id);
    });

    socket.on('like_count', (data) => {
        console.log('like_count')
        const likesCount = $(`#comment_${data.commentID}_likes`);
        likesCount.text(data.likes);
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

async function addNewComment() {
    const newCommentText = document.getElementById('addCommentText').value;

    if (newCommentText === '') {
        return;
    }

    const newComment = {
        text: newCommentText,
        user_id: userID,
    };

    try {
        //Send the comment to /plant/:id/comment
        const response = await axios.post(`/plant/${plantID}/comment`, newComment);

        console.log(response.data);

        socket.emit('new_comment', plantID, response.data);

        //Add the comment to the page
        await addCommentToPage(response.data._id);
    } catch (err) {
        console.error(err);
    }
}

async function addNewReply() {
    const commentID = document.getElementById('replyToCommentID').value;
    const newReplyText = document.getElementById('replyText').value;

    if (newReplyText === '') {
        return;
    }

    const newReply = {
        text: newReplyText,
        user_id: userID,
    };

    try {
        //Send the reply to /plant/:id/comment/:comment_id/reply
        const response = await axios.post(`/plant/${plantID}/comment/${commentID}/reply`, newReply);

        console.log(response.data);

        socket.emit('new_reply', plantID, response.data);

        //Add the reply to the page
        await addReplyToPage(commentID, response.data._id.toString());

        $('#replyToCommentModal').modal('hide');
        $('#replyText').val('');
        $('#replyToCommentID').val('');
    } catch (err) {
        console.error(err);
    }

}

async function addCommentToPage(commentID) {
    //Make a request to the /plant/:plant_id/comment/:comment_id/render route to get the HTML for the comment
    try {
        const response = await axios.get(`/plant/${plantID}/comment/${commentID}/render`);

        //Get the comments container
        const commentsContainer = document.getElementById('commentsContainer');

        const noCommentsRow = $('#noCommentsRow');
        //If the no comments row is visible, hide it
        if (noCommentsRow.is(':visible')) {
            noCommentsRow.hide();
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

async function addReplyToPage(commentID, replyID) {
    //Make a request to the /plant/:plant_id/comment/:comment_id/reply/:reply_id/render route to get the HTML for the comment
    try {
        const response = await axios.get(`/plant/${plantID}/comment/${commentID}/reply/${replyID}/render`);

        //Get the replies container
        const commentsContainer = document.getElementById('reply_container-' + commentID);

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
        commentsContainer.appendChild(newComment);
    } catch (err) {
        console.log(err)
    }
}

async function toggleLikeButton(commentID) {
    const likeIndicator = $(`#comment_${commentID}_like_indicator`);
    const likesCount = $(`#comment_${commentID}_likes`);

    const hasLiked = likeIndicator.hasClass('text-danger');
    const likes = parseInt(likesCount.text());

    const data = {
        userID: userID
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
            await axios.post(`/plant/${plantID}/comment/${commentID}/unlike`, data);
        } else {
            await axios.post(`/plant/${plantID}/comment/${commentID}/like`, data);
        }

        socket.emit('like_count', plantID, {commentID: commentID, likes: data.likes});

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
                likesCount.text(likes + 1);
            } else {
                likeIndicator.removeClass('text-danger');
                likeIndicator.removeClass('fa-solid');
                likeIndicator.addClass('fa-regular');
                likesCount.text(likes - 1);
            }
        }
    }

}

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
        userID: userID,
    }

    try {
        const response = await axios.post(`/plant/${plantID}/suggestion`, newSuggestion);

        socket.emit('new_suggestion', plantID, response.data);

        await addSuggestionToPage(response.data._id);

    } catch (err) {
        console.error(err);
    } finally {
        actionInProgress = false;
    }
}

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
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unupvote`, {userID: userID});

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
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/undownvote`, {userID: userID});

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/upvote route
                const response2 = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/upvote`, {userID: userID});

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
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/upvote`, {userID: userID});

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
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/undownvote`, {userID: userID});

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
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unupvote`, {userID: userID});

                //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/downvote route
                const response2 = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/downvote`, {userID: userID});

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
                const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/downvote`, {userID: userID});

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

async function acceptSuggestion(suggestionID) {
    if (actionInProgress) {
        return;
    }

    actionInProgress = true;

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

            //Show the accept buttons for all suggestions again
            allAcceptCols.each((col) => {
                $(col).removeClass('d-none');
            });

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/unaccept route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/unaccept`, {userID: userID});

            //Emit the suggestion_unaccepted event to the server
            socket.emit('suggestion_unaccepted', plantID, {suggestionID: suggestionID});

            success = true;
        } else {
            //If the suggestion is not accepted, add the accepted icon and send a request to the server to accept the suggestion
            suggestionAcceptIcon.addClass('fa-solid');
            suggestionAcceptIcon.removeClass('fa-regular');

            //Hide the accept buttons for all suggestions apart from the one that was accepted
            allAcceptCols.each((col) => {
                if ($(col).attr('id') !== `accept-col-${suggestionID}`) {
                    $(col).addClass('d-none');
                }
            });

            //Make a request to the /plant/:plant_id/suggestion/:suggestion_id/accept route
            const response = await axios.post(`/plant/${plantID}/suggestion/${suggestionID}/accept`, {userID: userID});

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

                allAcceptCols.each((col) => {
                    col.addClass('d-none');
                });
            } else {
                suggestionAcceptIcon.removeClass('fa-solid');
                suggestionAcceptIcon.addClass('fa-regular');

                allAcceptCols.each((col) => {
                    $(col).removeClass('d-none');
                });
            }
        }
        actionInProgress = false;
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

function openReplyModal(commentID) {
    $('#replyToCommentID').val(commentID);
    $('#replyToCommentModal').modal('show');
}