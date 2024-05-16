const $feedWrapper = $("#feed-wrapper")
const $feedRecentWrapper = $("#feed-recent-wrapper")

const $loadingSpinner = $("#loading-spinner")
const $updateSpinner = $("#update-spinner")
const $feedEnd = $("#feed-end")
const $errorBox = $("#error-box")
const updateFeedGap = 3000

$errorBox.hide()
$loadingSpinner.hide()
$updateSpinner.hide()
$feedEnd.hide()
$feedRecentWrapper.hide()

let currentPosts = []
socket = io()
let updateFeedTime = Date.now()

let selectedFilterMode = undefined;
let selectedSortMode = SortOrder.RECENT;

let pendingPostsBanner;
let pendingPostsCount;
let reconnectBanner;

// Decode Large Base64 Buffers
function Uint8ToString(u8a) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
}

const createPostDiv = (post, toRecent = false) => {
    // No image placeholder
    let imgSrc = "https://placehold.co/600x400?text=No Images";
    if (post.images && post.images.length && post.images.length > 0) {
        const img = post.images[0]
        const base64String = btoa(Uint8ToString(new Uint8Array(img.image_data.data)))
        imgSrc = `data:${img.image_type};base64,${img.image_data}`
    }
    return `
    <div class="row mb-3 border-1 border shadow-sm rounded-3 p-4 ${toRecent ? 'border-danger-subtle' : ''}">
        <div class="col-sm-4">
            <img src="${imgSrc}" alt="Post Image" class="w-100 object-fit-cover mh-200">
        </div>
        <div class="col-sm-8 d-flex flex-column justify-content-between align-items-start">
            <div class="d-flex justify-content-between w-100 mb-2">
                <h3 class="m-0"> ${post.title}</h3>
                <span class="align-self-center">${new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    })}</span>
            </div>
            <div class="fst-italic">
                ${(post.description.length > 50 ? post.description.slice(0, 50) : post.description) + "..."}
            </div>
            <div class="d-flex justify-content-between mt-3 w-100">
                <div class="align-self-center">
                    Identification:
                    <span class="text-shadow ${postStates.postStateToColor(post.state, "text-")}">${postStates.postStateToString(post.state)}</span>
                </div>
                <div class="btn btn-warning">Comments: <span id="comment-counter-${post._id}">${post.comments.length}</span></div>
                <a class="btn btn-primary" href="/plant/${post._id}">See more</a>
            </div>
        </div>
    </div>`
}

const updateFeed = (posts, append = true) => {
    for (let i = 0; i < posts.length; i++) {
        socket.emit("viewing_plant", {plant_id: posts[i]._id})
        const $newPost = $(createPostDiv(posts[i]))
        if (append) {
            $feedWrapper.append($newPost)
        } else {
            // Add most recent post to the top
            $feedWrapper.prepend($newPost);

            // Remove last post
            $feedWrapper.children().last().remove()
        }
    }

}

const addRecentPost = (post) => {
    socket.emit("viewing_plant", {plant_id: post._id})
    const $postDiv = $(createPostDiv(post, true))
    $feedRecentWrapper.prepend($postDiv)
    $feedRecentWrapper.show()
}

function registerSockets() {
    socket.on("new_comment", data => {
        const $commentCounter = $(`#comment-counter-${data.post_id}`)
        const count = parseInt($commentCounter.text()) + 1
        $commentCounter.text(count)
    })
    socket.emit("viewing_feed")
    socket.on("new_post", data => {
        addRecentPost(data.post)
    })
}

async function retrieveFirstPageDataFromServer() {
    try {
        // Fetch first page
        const response = await axios.get("/api/feed", {
            params: {
                lastPostId: null,
                filter: SortOrder.filterStateToInt(selectedFilterMode),
                sortBy: SortOrder.sortStateToInt(selectedSortMode)
            }
        })
        updateFeed(response.data.posts)
        currentPosts = [...response.data.posts]

        openFeedIDB().then(db => {
            clearFeedIDB(db).then(() => {
                updateFeedIDB(db, currentPosts).then(() => console.log("Feed cached!"))
            })
        })
    } catch (e) {
        console.log(e)
        $errorBox.show()
    }
}

$(document).ready(async function () {
    //Once the page is loaded, fetch the first page of posts
    if (isOnline) {
        registerSockets();
    } else {
        document.addEventListener("online", () => {
            registerSockets();
        });

        openFeedIDB().then(db => {
            getFeedIDB(db).then(posts => {
                for (let i = 0; i < posts.length; i++) {
                    $feedWrapper.append($(createPostDiv(posts[i])))
                }
                currentPosts = posts;
            })
            console.log("Feed retrieved from cache!")
        })
    }
});

//Filtering and sorting of posts
$(document).ready(async function () {
    //Try to get the cached sort state
    openFeedIDB().then(db => {
        getSortState(db).then(sortState => {
            if (sortState) {
                selectedFilterMode = sortState.filter;
                selectedSortMode = sortState.sort;
                $('#filterBy').val(selectedFilterMode);
                $('#sortBy').val(selectedSortMode);

                if (isOnline) {
                    retrieveFirstPageDataFromServer();
                }
            }
        });
    });

    // When the apply button is clicked, apply the filter and sort the posts
    $('#applyButton').on('click', async function (event) {
        event.preventDefault();
        selectedFilterMode = $('#filterBy').val();
        selectedSortMode = $('#sortBy').val();

        // Clear the feed as we are changing the filter
        $feedWrapper.empty();

        if (isOnline) {
            try {
                const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
                const sortByValue = SortOrder.sortStateToInt(selectedSortMode);

                const response = await axios.get("/api/feed", {
                    params: {
                        lastPostId: null,
                        filter: filterValue,
                        sortBy: sortByValue
                    }
                })

                updateFeed(response.data.posts)
                currentPosts = [...response.data.posts]

                openFeedIDB().then(db => {
                    clearFeedIDB(db).then(() => {
                        updateFeedIDB(db, currentPosts).then(() => console.log("Cached updated feed!"))

                        // Update the sort state in the cache
                        setSortState(db, {
                            filter: selectedFilterMode,
                            sort: selectedSortMode
                        }).then(() => console.log("Cached updated sort state!"))
                    })
                })
            } catch (e) {
                console.log(e)
                $errorBox.show()
            }

        } else {
            // Offline mode handling
            openFeedIDB().then(db => {
                getFeedIDB(db).then(posts => {
                    let filteredPosts = posts;

                    // Apply post filter if a filter other than all is selected
                    if (selectedFilterMode !== "-1") {
                        const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
                        filteredPosts = filteredPosts.filter(post => post.state === filterValue);
                    }

                    // Apply post sort
                    switch (SortOrder.sortStateToInt(selectedSortMode)) {
                        case SortOrder.RECENT:
                            filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            break;
                        case SortOrder.OLDEST:
                            filteredPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            break;
                        case SortOrder.MOST_COMMENTED:
                            filteredPosts.sort((a, b) => b.comments.length - a.comments.length);
                            break;
                    }

                    updateFeed(filteredPosts);
                    currentPosts = filteredPosts;
                });
            });
        }
    });

    $(window).scroll(async function () {

        if (isOnline) {
            const timeDiff = Date.now() - updateFeedTime

            // Fetch another page when scrolled to the bottom
            if (timeDiff > updateFeedGap && $(window).scrollTop() + $(window).height() >= $(document).height()) {
                updateFeedTime = Date.now()
                $feedEnd.hide()
                $loadingSpinner.show()

                const lastPost = currentPosts[currentPosts.length - 1]
                const response = await axios.get("/api/feed", {
                    params: {
                        lastPostId: lastPost._id,
                        filter: SortOrder.filterStateToInt(selectedFilterMode),
                        sortBy: SortOrder.sortStateToInt(selectedSortMode)
                    }
                })

                updateFeed(response.data.posts)
                currentPosts = [...currentPosts, ...response.data.posts]
                if (response.data.posts.length <= 0) {
                    $feedEnd.show()
                }
                $loadingSpinner.hide()
            }

            // Refresh feed
            if (timeDiff > updateFeedGap && $(window).scrollTop() <= 0) {
                updateFeedTime = Date.now()

                $feedWrapper.empty()
                $feedRecentWrapper.empty()
                $feedRecentWrapper.hide()
                $feedEnd.hide()
                $updateSpinner.show()
                currentPosts.map(post => socket.emit("leaving_plant", {plant_id: post._id}))

                try {
                    const response = await axios.get("/api/feed", {
                        params: {
                            lastPostId: null,
                            filter: SortOrder.filterStateToInt(selectedFilterMode),
                            sortBy: SortOrder.sortStateToInt(selectedSortMode)
                        }
                    })

                    updateFeed(response.data.posts)
                    currentPosts = response.data.posts
                    $updateSpinner.hide()
                    updateFeedTime = Date.now()
                } catch (e) {
                    $errorBox.show();
                }

            }
        }
    });

    window.addEventListener("online", async () => {
        // Clear out recent posts
        $feedRecentWrapper.empty()
        $feedRecentWrapper.hide()

        const db = await openFeedIDB();
        const posts = await getFeedIDB(db)

        const response = await axios.post("/api/fetch-missing-posts", {
            lastPostDateTime: posts.length > 0 ? posts[0].createdAt : null,
            filter: SortOrder.filterStateToInt(selectedFilterMode),
            sortBy: SortOrder.sortStateToInt(selectedSortMode)
        })

        currentPosts = [...response.data.newPosts, ...currentPosts]
        currentPosts = currentPosts.slice(0, 10)

        // As the function uses prepend and the array is sorted already the new posts have to be reversed
        updateFeed(response.data.newPosts.reverse(), false)

        // Cache new posts
        if (response.data.newPosts.length > 0) {
            openFeedIDB().then(db => {
                clearFeedIDB(db).then(() => {
                    updateFeedIDB(db, currentPosts).then(() => console.log("Updated feed cached!"))
                })
            })
        }
    })
});

document.addEventListener('DOMContentLoaded', async function () {
    pendingPostsCount = $('#pendingPostsCount');
    pendingPostsBanner = $('#pendingPostsBanner');
    reconnectBanner = $('#reconnect-banner')

    if (isOnline) {
        pendingPostsBanner.addClass('d-none');
        reconnectBanner.addClass('d-none');
    } else {
        const postIdb = await openNewPostIdb();
        const posts = await getPostsFromIDB(postIdb);

        const postCount = posts.length;

        reconnectBanner.removeClass('d-none');
        pendingPostsBanner.removeClass('d-none');
        pendingPostsCount.text(postCount);
    }

    window.addEventListener('online', async function () {
        pendingPostsBanner.addClass('d-none');
        reconnectBanner.addClass('d-none');
    });

    window.addEventListener('offline', async function () {
        const postIdb = await openNewPostIdb();
        const posts = await getPostsFromIDB(postIdb);

        const postCount = posts.length;

        reconnectBanner.removeClass('d-none');
        pendingPostsBanner.removeClass('d-none');
        pendingPostsCount.text(postCount);
    });
});

window.addEventListener('beforeunload', function (event) {
    currentPosts.map(post => socket.emit("leaving_plant", {plant_id: post._id}))
    socket.emit("leaving_feed")
});