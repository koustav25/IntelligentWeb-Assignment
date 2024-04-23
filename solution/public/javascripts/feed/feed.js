const mockPost = {
    plantId: 5,
    title: "Rose",
    shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
    time: new Date(2024, 4, 1), // May 1, 2024
    img: "https://source.unsplash.com/random/?plants&page=1",
    numOfComments: 10,
    identification: "Completed"
}
const createPostDiv = post => {
    return `
    <div class="row mb-3 border-1 border shadow-sm rounded-3 p-4">
        <div class="col-sm-4">
            <img src="${post.img}" alt="" class="w-100 object-fit-cover mh-200">
        </div>
        <div class="col-sm-8 d-flex flex-column justify-content-between align-items-start">
            <div class="d-flex justify-content-between w-100 mb-2">
                <h3 class="m-0"> ${post.title}</h3>
                <span class="align-self-center">${ post.time.toLocaleDateString() }</span>
            </div>
            <div class="fst-italic">
                ${ post.shortDesc + "..." }
            </div>
            <div class="d-flex justify-content-between mt-3 w-100">
                <div class="align-self-center">
                    Identification:
                    <span class="text-shadow ${ post.identification === "Completed" ? "text-success" : "text-warning" }">${ post.identification }</span>
                </div>
                <div class="btn btn-warning">Comments: ${ post.numOfComments }</div>
                <a class="btn btn-primary" href="/plant/<%= post.plantId %>">See more</a>
            </div>
        </div>
    </div>`
}

const feedWrapper = $("#feed-wrapper")
const loadingSpinner = $("#loading-spinner")
const updateSpinner = $("#update-spinner")
loadingSpinner.hide()
updateSpinner.hide()
$(document).ready(function() {
    $(window).scroll(async function() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
            loadingSpinner.show()
            await setTimeout(() => {
                for(let i = 0; i < 10; i++){
                    const $newPost = $(createPostDiv(mockPost))
                    feedWrapper.append($newPost)
                }
                loadingSpinner.hide()
            }, 3000)
        }
        if ($(window).scrollTop() <= 0) {
            updateSpinner.show()
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

    if(navigator.onLine){
        console.log("Online")
    } else {
        console.log("Offline")
    }
})