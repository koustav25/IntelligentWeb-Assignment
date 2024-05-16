let $offlineBox;
let $searchBar;
let $searchWarn;

var isOnline = navigator.onLine;

document.addEventListener('DOMContentLoaded', function() {
    $offlineBox = $('#offline-mode');
    $searchBar = $('#searchBar');
    $searchWarn = $('#searchWarn');

    if (isOnline) {
        $searchWarn.addClass('d-none');
        $searchBar.removeClass('d-none');
        $offlineBox.hide();
    } else {
        $searchWarn.removeClass('d-none');
        $searchBar.addClass('d-none');
        $offlineBox.show();
    }

    window.addEventListener('offline', (e) => {
        $offlineBox.show();
        $searchWarn.removeClass('d-none');
        $searchBar.addClass('d-none');
        isOnline = false
    });

    window.addEventListener('online',  (e) => {
        $offlineBox.hide();
        $searchWarn.addClass('d-none');
        $searchBar.removeClass('d-none');
        isOnline = true
    })
});
