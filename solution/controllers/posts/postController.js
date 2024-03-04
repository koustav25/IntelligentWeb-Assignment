function getPost(req, res) {
    //TODO: Render the post view
    //res.render('post', { title: 'Post' })

    res.send('Post')
}

function getPlant(req, res) {
    //TODO: Render the plant view
    //res.render('plant', { title: 'Plant' })

    res.send('Plant')
}

module.exports = {
    getPost,
    getPlant
}