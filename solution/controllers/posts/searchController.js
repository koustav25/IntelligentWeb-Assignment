function getSearch(req, res) {
    //TODO: Render the search view
    //res.render('search', { title: 'Search' });

    res.send('Search');
}

module.exports = {
    getSearch
}