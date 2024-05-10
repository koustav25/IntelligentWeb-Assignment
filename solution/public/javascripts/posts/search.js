socket = io();

function registerSockets() {
    const posts = $('.plant-post');
    posts.each(function() {
        const postId = $(this).data('plant-id');
        socket.emit('viewing_plant', { plant_id: postId });
        console.log('viewing plant', postId);
    });

    socket.on('new_comment', data => {
        const $commentCounter = $(`.comment-count[data-post-id="${data.post_id}"]`);
        const count = parseInt($commentCounter.text()) + 1;
        $commentCounter.text(count);
    });

    document.addEventListener('beforeunload', function() {
        posts.each(function() {
            const postId = $(this).data('plant-id');
            socket.emit('leaving_plant', { plant_id: postId });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if(isOnline) {
        registerSockets();
    } else {
        window.addEventListener('online', function() {
            registerSockets();
        });
    }
    $('#searchForm').on('submit', function() {
        event.preventDefault();
        event.stopPropagation();
        const searchText = $('#searchPrompt').val();
        const sortOrder = $('#sortOrder').val();

        //Submit the form as GET request
        let url = '/search';
        let hasSearchText = false;
        //Add the parameters to the URL if they are not empty
        if (searchText) {
            url += `?text=${searchText}`;
            hasSearchText = true;
        }
        if (sortOrder && sortOrder !== 'recent') {
            url += `${hasSearchText ? '&' : '?'}order=${sortOrder}`;
        }

        window.location.href = url;
    });

});