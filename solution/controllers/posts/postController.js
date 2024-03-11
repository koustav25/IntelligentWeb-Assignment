function getPost(req, res) {
    //TODO: Render the post view
    //res.render('post', { title: 'Post' })

    res.send('Post')
}

function getPlant(req, res) {
    //TODO: Render the plant view

    const comments = [
        {
            username: "user1",
            content: "This is a comment",
            likes: 5,
            date: "2020-01-01",
            replies: [
                {
                    username: "user2",
                    content: "This is a reply",
                    likes: 2,
                    date: "2020-01-02",
                    replies: []
                }
            ]
        },
        {
            username: "user1",
            content: "This is a comment",
            likes: 5,
            date: "2020-01-01",
            replies: [
                {
                    username: "user2",
                    content: "This is a reply",
                    likes: 2,
                    date: "2020-01-02",
                    replies: []
                }
            ]
        },
        {
            username: "user1",
            content: "This is a comment",
            likes: 5,
            date: "2020-01-01",
            replies: [
                {
                    username: "user2",
                    content: "This is a reply",
                    likes: 2,
                    date: "2020-01-02",
                    replies: []
                }
            ]
        },
    ]

    res.render('posts/plant_details', { title: 'Plant', comments: comments})
}

module.exports = {
    getPost,
    getPlant
}