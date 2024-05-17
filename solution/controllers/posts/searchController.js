const {getPostById, getPostsBySearchTerms} = require("../../model/mongodb");
const postStates = require("../../model/enum/postStates");

const MAX_POSTS = 10;

async function getSearch(req, res) {
    const search_text = req.query.text ?? "";
    const search_order = req.query.order ?? "recent";

    const empty_query = search_text === "";

    const searchResults = await getPostsBySearchTerms(search_text, search_order);

    res.render('posts/search', {isLoggedIn: req.isLoggedIn, user: req.user, searchResults, search_text, search_order, empty_query, postStates});
}

module.exports = {
    getSearch
}