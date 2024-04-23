// Decode Large Base64 Buffers
function Uint8ToString(u8a){
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
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
                ${post.shortDesc + "..."}
            </div>
            <div class="d-flex justify-content-between mt-3 w-100">
                <div class="align-self-center">
                    Identification:
                    <span class="text-shadow ${post.identification.is_accepted ? "text-success" : "text-warning"}">${post.identification.is_accepted ? "Completed" : "In Progress"}</span>
                </div>
                <div class="btn btn-warning">Comments: ${post.comments.length}</div>
                <a class="btn btn-primary" href="/plant/<%= post.plantId %>">See more</a>
            </div>
        </div>
    </div>`
}



const $feedWrapper = $("#feed-wrapper")
const $loadingSpinner = $("#loading-spinner")
const $updateSpinner = $("#update-spinner")
const $feedEnd = $("#feed-end")
$loadingSpinner.hide()
$updateSpinner.hide()
$feedEnd.hide()
let pageCounter = 2

$(document).ready(function () {
    $(window).scroll(async function () {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
            $feedEnd.hide()
            $loadingSpinner.show()
            const newPosts = await axios.get("/api/feed", {params: {page: pageCounter}})
            for (let i = 0; i < newPosts.data.length; i++) {
                const $newPost = $(createPostDiv(newPosts.data[i]))
                $feedWrapper.append($newPost)
            }
            if (newPosts.data.length > 0) {
                pageCounter += 1
            } else {
                $feedEnd.show()
            }

            $loadingSpinner.hide()
        }
        if ($(window).scrollTop() <= 0) {
            pageCounter = 1
            $feedWrapper.empty()
            $feedEnd.hide()
            $updateSpinner.show()
            const updatePosts = await axios.get("/api/feed")
            for (let i = 0; i < updatePosts.data.length; i++) {
                $feedWrapper.append($(createPostDiv(updatePosts.data[i])))
            }
            $updateSpinner.hide()
            pageCounter += 1
        }
    });
});

$(window).ready(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/javascripts/service_worker/sw.js', {scope: '/javascripts/service_worker/sw.js'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    if ("Notification" in window) {
        if (Notification.permission === "granted") {
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(p => {
                if (p === " granted") {
                    navigator.serviceWorker.ready.then(swr => {
                        swr.showNotification("Plants App", {body: "Notifications are enabled!"}).then(r => console.log(r))
                    })
                }
            })
        }
    }

    if (navigator.onLine) {
        console.log("Online")
    } else {
        console.log("Offline")
    }
})