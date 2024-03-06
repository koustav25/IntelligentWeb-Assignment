function getPost(req, res) {
    //TODO: Render the post view
    //res.render('post', { title: 'Post' })

    res.send('Post')
}

function getPlant(req, res) {
    //TODO: Render the plant view
    res.render('posts/plant_details', { title: 'Plant' })
}

module.exports = {
    getPost,
    getPlant
}