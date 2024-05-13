// Decode Large Base64 Buffers
function Uint8ToString(u8a){
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i=0; i < u8a.length; i+=CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
    }
    return c.join("");
}
const createPostDiv = post => {
    // No image placeholder
    let imgSrc = "https://placehold.co/600x400?text=No Images";
    if (post.images.length && post.images.length > 0) {
        const img = post.images[0]
        const base64String = btoa(Uint8ToString(new Uint8Array(img.image_data.data)))
        imgSrc = `data:${img.image_type};base64,${base64String}`
    }
    return `
    <div class="row mb-3 border-1 border shadow-sm rounded-3 p-4">
        <div class="col-sm-4">
            <img src="${imgSrc}" alt="Post Image" class="w-100 object-fit-cover mh-200">
        </div>
        <div class="col-sm-8 d-flex flex-column justify-content-between align-items-start">
            <div class="d-flex justify-content-between w-100 mb-2">
                <h3 class="m-0"> ${post.title}</h3>
                <span class="align-self-center">${new Date(post.seen_at).toLocaleDateString('en-GB', {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    })}</span>
            </div>
            <div class="fst-italic">
                ${(post.description.length > 50 ? post.description.slice(0,50) : post.description) + "..."}
            </div>
            <div class="d-flex justify-content-between mt-3 w-100">
                <div class="align-self-center">
                    Identification:
                    <span class="text-shadow ${postStates.postStateToColor(post.state,"text-")}">${postStates.postStateToString(post.state)}</span>
                </div>
                <div class="btn btn-warning">Comments: <span id="comment-counter-${post._id}">${post.comments.length}</span></div>
                <a class="btn btn-primary" href="/plant/${post._id}">See more</a>
            </div>
        </div>
    </div>`
}



const $feedWrapper = $("#feed-wrapper")
const $loadingSpinner = $("#loading-spinner")
const $updateSpinner = $("#update-spinner")
const $feedEnd = $("#feed-end")
const $errorBox = $("#error-box")
const updateFeedGap = 3000

$errorBox.hide()
$loadingSpinner.hide()
$updateSpinner.hide()
$feedEnd.hide()

let page = 1
let currentPosts = []
socket = io()
let updateFeedTime = Date.now()

const updateFeed = (posts) => {
    for (let i = 0; i < posts.length; i++) {
        socket.emit("viewing_plant", {plant_id: posts[i]._id})
        const $newPost = $(createPostDiv(posts[i]))
        $feedWrapper.append($newPost)
    }

}
$(document).ready(async function () {
    if(isOnline){
        socket.on("new_comment", data => {
            const $commentCounter = $(`#comment-counter-${data.post_id}`)
            const count = parseInt($commentCounter.text()) + 1
            $commentCounter.text(count)
        })
        try {
            const response = await axios.get("/api/feed", {params: {page}})
            updateFeed(response.data.posts)
            currentPosts = [...response.data.posts]
            page += 1

            openFeedIDB().then(db => {
                clearFeedIDB(db).then(() => {
                    updateFeedIDB(db,currentPosts).then(() => console.log("Feed cached!"))
                })
            })
        }catch (e){
            console.log(e)
            $errorBox.show()
        }

    } else {
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


    $(window).scroll(async function () {

        if(isOnline){
            const timeDiff = Date.now() - updateFeedTime
            if (timeDiff > updateFeedGap && $(window).scrollTop() + $(window).height() >= $(document).height()) {
                updateFeedTime = Date.now()

                $feedEnd.hide()
                $loadingSpinner.show()
                const response = await axios.get("/api/feed", {params: {page}})
                updateFeed(response.data.posts)
                currentPosts = [...currentPosts, ...response.data.posts]
                if (response.data.posts.length > 0) {
                    page += 1
                } else {
                    $feedEnd.show()
                }
                $loadingSpinner.hide()
            }

            if (timeDiff > updateFeedGap && $(window).scrollTop() <= 0) {
                updateFeedTime = Date.now()

                page = 1
                $feedWrapper.empty()
                $feedEnd.hide()
                $updateSpinner.show()
                currentPosts.map(post => socket.emit("leaving_plant", {plant_id: post._id}))

                try {
                    const response = await axios.get("/api/feed")
                    updateFeed(response.data.posts)
                    currentPosts = response.data.posts
                    $updateSpinner.hide()
                    page += 1
                    updateFeedTime = Date.now()
                }catch (e){
                    $errorBox.show();
                }

            }
        }
    });
});

window.addEventListener('beforeunload', function (event) {
    currentPosts.map(post => socket.emit("leaving_plant", {plant_id: post._id}))
});