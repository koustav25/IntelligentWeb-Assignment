document.addEventListener('DOMContentLoaded', function() {
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