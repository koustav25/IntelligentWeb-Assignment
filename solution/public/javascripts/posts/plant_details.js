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

function openReplyModal(commentID) {
    $('#replyToCommentID').val(commentID);
    $('#replyToCommentModal').modal('show');
}