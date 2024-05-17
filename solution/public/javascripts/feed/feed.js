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

const locationUnavailableToastId = "locationUnavailableToast";

// Decode Large Base64 Buffers
function Uint8ToString(u8a) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
}

const createPostDiv = (post, toRecent = false, dist_km = "Unknown") => {
    //If dist_km is a number, round it to 2 decimal places
    if (typeof dist_km === "number") {
        dist_km = dist_km.toFixed(2)
    }
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
            <div>
                <h3 class="m-0"> ${post.title}</h3> <p class="small">(<span class="fw-bold">${dist_km}</span>  km away)</p>
                </div>
                <span class="">${new Date(post.createdAt).toLocaleDateString('en-GB', {
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
                    <p>Identification:
                    <span class="text-shadow ${postStates.postStateToColor(post.state, "text-")}">${postStates.postStateToString(post.state)}</span>
                    </p>
                </div>
                <div class="btn btn-warning">Comments: <span id="comment-counter-${post._id}">${post.comments.length}</span></div>
                <a class="btn btn-primary" href="/plant/${post._id}">See more</a>
            </div>
        </div>
    </div>`
}

function displayPosts(posts, append, lat, long) {
    for (let i = 0; i < posts.length; i++) {
        dist_km = "Unknown"
        if (lat && long) {
            dist_km = haversine_distance(lat, long, posts[i].location.coords.coordinates[1], posts[i].location.coords.coordinates[0]);
        }

        socket.emit("viewing_plant", {plant_id: posts[i]._id})
        const $newPost = $(createPostDiv(posts[i], false, dist_km))
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

const updateFeed = (posts, append = true) => {
    //If the user's location is available, calculate the distance between the user and the post
    let lat = 0;
    let lon = 0;
    let dist_km = "Unknown"
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;

            displayPosts(posts, append, lat, lon);
        }, function () {
            displayPosts(posts, append, null, null);
        });
    }

}

const addRecentPost = (post) => {
    //If the user's location is available, calculate the distance between the user and the post
    let lat = 0;
    let lon = 0;
    let dist_km = "Unknown"
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            dist_km = haversine_distance(lat, lon, post.location.coordinates[1], post.location.coordinates[0]);

            socket.emit("viewing_plant", {plant_id: post._id})
            const $postDiv = $(createPostDiv(post, true, dist_km))
            $feedRecentWrapper.prepend($postDiv)
            $feedRecentWrapper.show()
        }, function () {
            dist_km = "Unknown"

            socket.emit("viewing_plant", {plant_id: post._id})
            const $postDiv = $(createPostDiv(post, true, dist_km))
            $feedRecentWrapper.prepend($postDiv)
            $feedRecentWrapper.show()
        });
    }
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

async function retrieveFirstPageDataFromServer(sortValue, filterValue, lat, lon) {
    try {
        // Fetch first page
        const response = await getPostsFromApi(null, filterValue, sortValue, lat, lon);

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

// Initialise toasts in the document
document.addEventListener('DOMContentLoaded', async function () {
    const toastElList = document.querySelectorAll('.toast')
    const toastList = [...toastElList].map(toastEl => new bootstrap.Toast(toastEl, {}))
});

const showToast = (id) => {
    //Get the toast element
    const toastEl = document.getElementById(id);
    //Get the toast instance
    const toast = bootstrap.Toast.getInstance(toastEl);

    if (toast) {
        //Show the toast
        toast.show();
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
                //If the user's location is available, calculate the distance between the user and the post
                let lat = 0;
                let lon = 0;
                let dist_km = "Unknown"
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;
                        dist_km = haversine_distance(lat, lon, post.location.coordinates[1], post.location.coordinates[0]);

                        for (let i = 0; i < posts.length; i++) {
                            $feedWrapper.append($(createPostDiv(posts[i], false, dist_km)))
                        }
                    }, function () {
                        dist_km = "Unknown"

                        for (let i = 0; i < posts.length; i++) {
                            $feedWrapper.append($(createPostDiv(posts[i], false, dist_km)))
                        }
                    });
                }
                currentPosts = posts;
            })
            console.log("Feed retrieved from cache!")
        })
    }
});

function checkLocationPermission($sortBy) {
    //If the sort is set to by distance, we need to try and get the user's location
    //If we can't get the user's location, we should show an error message, and disable the option to sort by distance, and reset the sort to recent
    if (selectedSortMode === SortOrder.sortStateIntToString(SortOrder.DISTANCE)) {
        //Check if the user's location is available
        if (!navigator.geolocation) {
            //If the user's location is not available, show an error message
            showToast(locationUnavailableToastId);

            //Reset the filter to recent
            $sortBy.val(SortOrder.sortStateIntToString(SortOrder.RECENT));
            selectedSortMode = SortOrder.sortStateIntToString(SortOrder.RECENT);

            //Disable the filter by distance option
            $sortBy.find(`option[value="${SortOrder.DISTANCE}"]`).prop('disabled', true);
        }
    }
}

function handleLocationFailure($sortBy) {
    //If the user's location is not available, show an error message
    showToast(locationUnavailableToastId);

    //Reset the filter to recent
    $sortBy.val(SortOrder.sortStateIntToString(SortOrder.RECENT));
    selectedSortMode = SortOrder.sortStateIntToString(SortOrder.RECENT);

    //Disable the filter by distance option
    $sortBy.find(`option[value="${SortOrder.DISTANCE}"]`).prop('disabled', true);

    // Call the apply button click event to refresh the feed
    $('#applyButton').click();
}

async function processMissingPosts(posts, filterValue, sortValue, lat, lon) {
    //The posts may not be sorted as expected, so we first need to sort the posts based on the selected sort order
    //First, shallow copy the posts array so we can reorder it
    const tempPosts = [...posts]
    switch (sortValue) {
        case SortOrder.RECENT:
            tempPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case SortOrder.OLDEST:
            tempPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case SortOrder.DISTANCE:
            tempPosts.sort((a, b) => {
                const distanceA = haversine_distance(lat, lon, a.location.coordinates[1], a.location.coordinates[0]);
                const distanceB = haversine_distance(lat, lon, b.location.coordinates[1], b.location.coordinates[0]);
                return distanceA - distanceB;
            });
            break;
    }

    const response = await axios.post("/api/fetch-missing-posts", {
        lastPostDateTime: tempPosts.length > 0 ? tempPosts[0].createdAt : null,
        filter: filterValue,
        sortBy: sortValue,
        lat: lat,
        lon: lon,
        lastPostDistance: tempPosts.length > 0 ? tempPosts[0].distance : null
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
}

async function getPostsFromApi(lastPostId, filterValue, sortByValue, lat, lon, lastPostDistance = null) {
    const response = await axios.get("/api/feed", {
        params: {
            lastPostId: lastPostId,
            filter: filterValue,
            sortBy: sortByValue,
            lat: lat,
            lon: lon,
            lastPostDistance: lastPostDistance
        }
    });
    updateFeed(response.data.posts);
    return response;
}

async function fetchNewPosts(filterValue, sortByValue, lat, lon, lastPostDistance = null) {
    const response = await getPostsFromApi(null, filterValue, sortByValue, lat, lon, lastPostDistance);
    currentPosts = [...response.data.posts];

    openFeedIDB().then(db => {
        clearFeedIDB(db).then(() => {
            updateFeedIDB(db, currentPosts).then(() => console.log("Cached updated feed!"));

            // Update the sort state in the cache
            setSortState(db, {
                filter: selectedFilterMode,
                sort: selectedSortMode
            }).then(() => console.log("Cached updated sort state!"));
        });
    });
}

async function fetchNextPosts(lastPostId, filterValue, sortByValue, lat, lon, lastPostDistance = null) {
    const response = await getPostsFromApi(lastPostId, filterValue, sortByValue, lat, lon, lastPostDistance);
    currentPosts = [...currentPosts, ...response.data.posts]
    if (response.data.posts.length <= 0) {
        $feedEnd.show()
    }
    $loadingSpinner.hide()
}

async function fetchRefreshedFeed(filterValue, sortByValue, lat, lon) {
    const response = await getPostsFromApi(null, filterValue, sortByValue, lat, lon);

    updateFeed(response.data.posts)
    currentPosts = response.data.posts
    $updateSpinner.hide()
    updateFeedTime = Date.now()
}

//Filtering and sorting of posts
$(document).ready(async function () {
    //Try to get the cached sort state
    let $filterBy = $('#filterBy');
    let $sortBy = $('#sortBy');
    openFeedIDB().then(db => {
        getSortState(db).then(sortState => {
            if (sortState) {
                selectedFilterMode = sortState.filter;
                selectedSortMode = sortState.sort;
                $filterBy.val(selectedFilterMode);
                $sortBy.val(selectedSortMode);

                if (isOnline) {
                    checkLocationPermission($sortBy)

                    const filter = SortOrder.filterStateToInt(selectedFilterMode);
                    const sort = SortOrder.sortStateToInt(selectedSortMode);

                    if (selectedSortMode === SortOrder.sortStateIntToString(SortOrder.DISTANCE) && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async function (position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            await retrieveFirstPageDataFromServer(sort, filter, lat, lon);
                        }, () => handleLocationFailure($sortBy));
                    } else {
                        retrieveFirstPageDataFromServer(sort, filter, null, null);
                    }
                }
            }
        });
    });

    // When the apply button is clicked, apply the filter and sort the posts
    $('#applyButton').on('click', async function (event) {
        event.preventDefault();
        selectedFilterMode = $filterBy.val();
        selectedSortMode = $sortBy.val();

        checkLocationPermission($sortBy);

        // Clear the feed as we are changing the filter
        $feedWrapper.empty();

        if (isOnline) {
            try {
                const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
                const sortByValue = SortOrder.sortStateToInt(selectedSortMode);

                //If the filter is set to by distance, we need to get the user's location
                if (sortByValue === SortOrder.DISTANCE) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async function (position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            await fetchNewPosts(filterValue, sortByValue, lat, lon);
                        }, () => handleLocationFailure($sortBy));
                    }
                } else {
                    await fetchNewPosts(filterValue, sortByValue, null, null);
                }
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
                        case SortOrder.DISTANCE:
                            // Sort by distance
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(async function (position) {
                                    const lat = position.coords.latitude;
                                    const lon = position.coords.longitude;
                                    filteredPosts.sort((a, b) => {
                                        const distanceA = haversine_distance(lat, lon, a.location.coordinates[1], a.location.coordinates[0]);
                                        const distanceB = haversine_distance(lat, lon, b.location.coordinates[1], b.location.coordinates[0]);
                                        return distanceA - distanceB;
                                    }, () => handleLocationFailure($sortBy));
                                    updateFeed(filteredPosts);
                                    currentPosts = filteredPosts;

                                    // Update the sort state in the cache
                                    setSortState(db, {
                                        sort: selectedSortMode,
                                        filter: selectedFilterMode
                                    }).then(() => console.log("Cached updated sort state!"))
                                });
                            }
                            break;
                    }

                    updateFeed(filteredPosts);
                    currentPosts = filteredPosts;

                    // Update the sort state in the cache
                    setSortState(db, {
                        sort: selectedSortMode,
                        filter: selectedFilterMode
                    }).then(() => console.log("Cached updated sort state!"))
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

                checkLocationPermission($sortBy)

                const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
                const sortByValue = SortOrder.sortStateToInt(selectedSortMode);

                if (selectedSortMode === SortOrder.sortStateIntToString(SortOrder.DISTANCE) && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async function (position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        await fetchNextPosts(lastPost._id, filterValue, sortByValue, lat, lon, lastPost.distance);
                    }, () => handleLocationFailure($sortBy));
                } else {
                    await fetchNextPosts(lastPost._id, filterValue, sortByValue, null, null);
                }
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

                checkLocationPermission($sortBy)

                const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
                const sortByValue = SortOrder.sortStateToInt(selectedSortMode);

                try {
                    if (selectedSortMode === SortOrder.sortStateIntToString(SortOrder.DISTANCE) && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async function (position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            await fetchRefreshedFeed(filterValue, sortByValue, lat, lon);
                        }, () => handleLocationFailure($sortBy));
                    } else {
                        await fetchRefreshedFeed(filterValue, sortByValue, null, null);
                    }
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

        checkLocationPermission($sortBy)

        const filterValue = SortOrder.filterStateToInt(selectedFilterMode);
        const sortByValue = SortOrder.sortStateToInt(selectedSortMode);

        if (selectedSortMode === SortOrder.sortStateIntToString(SortOrder.DISTANCE) && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await processMissingPosts(posts, filterValue, sortByValue, lat, lon);
            }, () => handleLocationFailure($sortBy));
        } else {
            await processMissingPosts(posts, filterValue, sortByValue, null, null);
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